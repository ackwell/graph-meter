
function Data() {
	this.graph = new Graph();
	this.encounter = null;
	this.history = [];
	this.stat = '';
	this.currentlyViewing = null;
}

Data.prototype.push = function(detail) {
	// Parse the duration field now so I don't have to think about it later
	detail.Encounter.DURATION = parseInt(detail.Encounter.DURATION);

	// New encounter, reset the graphs and make a new encounter object to track everything
	if (!this.encounter || this.encounter.isNewEncounter(detail)) {
		// If there's an existing encounter, save it into history, and cull to keep under control
		if (this.encounter) {
			this.history.push(this.encounter);
			if (this.history.length > config.historyLength) {
				this.history.shift();
			}
		}

		var oldEncounter = this.encounter;
		this.encounter = new Encounter(detail);

		if (this.currentlyViewing === oldEncounter) {
			this.currentlyViewing = this.encounter;
			this.graph.reset();
		}

		this.updateHistoryControls();
	}

	var success = true;

	// Only push active details, inactive are the same as the last active, and just fuck up the timing.
	if (detail.isActive) {
		success = this.encounter.push(detail);
	} else {
		this.encounter.updateEncounter(detail.Encounter);
		this.encounter.active = false;
		this.updateHistoryControls(true);
	}

	// If we're not viewing the current encounter, just kill out now, don't touch the graph
	if (this.currentlyViewing !== this.encounter) {
		return;
	}

	// If adding the data failed for some reason, just re-render the graph.
	if (!success) {
		this.graph.render();
		return;
	}

	// If isActive is false, the encounter has ended. Update the graph with a full view of the encounter
	if (!detail.isActive) {
		this.graph.cullOld = false;
		this.graph.set(this.encounter.allFor(this.stat));

	} else {
		this.graph.cullOld = true;
		this.graph.push(this.encounter.duration, this.encounter.latestFor(this.stat));
	}

	this.graph.render();
}

Data.prototype.updateHistoryControls = function(nameCurrent) {
	var controlEncounters = [{
		name: nameCurrent? this.encounter.getEncounterName() : 'Current',
		index: 'current'
	}];

	for (var i = this.history.length - 1; i >= 0; i--) {
		controlEncounters.push({
			name: this.history[i].getEncounterName(),
			index: i
		});
	}

	window.updateHistoryControls(controlEncounters);
}

Data.prototype.switchEncounter = function(index) {
	if (index === 'current') {
		this.graph.cullOld = this.encounter.active;
		this.currentlyViewing = this.encounter;
		this.graph.set(this.encounter.sinceFor(this.encounter.duration - 180000, this.stat));

	} else {
		this.graph.cullOld = false;
		this.currentlyViewing = this.history[index];
		this.graph.set(this.history[index].allFor(this.stat));
	}

	this.graph.render();
}

// Switch the stat being tracked on the graph
Data.prototype.switchStat = function(stat) {
	this.stat = stat;

	// If the graph or encounter hasn't been set up yet (first call, usually), can stop now.
	if (!this.currentlyViewing || !this.graph) {
		return;
	}

	var time = this.graph.getFirstTime();

	this.graph.set(this.currentlyViewing.sinceFor(time, this.stat));
	this.graph.render();
}

// Retrieve combatant information from the current encounter by key
Data.prototype.getCombatant = function(key) {
	return this.currentlyViewing.getCombatant(key);
}


function Encounter(detail) {
	this.start = new Date().getTime();
	this.duration = 0;
	this.active = true;

	this.encounter = detail.Encounter;
	this.data = [];
}

Encounter.prototype.isNewEncounter = function(detail) {
	return this.encounter.CurrentZoneName !== detail.Encounter.CurrentZoneName ||
		this.encounter.DURATION > detail.Encounter.DURATION;
}

Encounter.prototype.push = function(detail) {
	var dur = new Date().getTime() - this.start
	var enc = detail.Encounter;

	// Ignore entries with less than a GCD of time, they tend to have absurd stats due to the tiny duration
	if (dur <= 2500) {
		return false;
	}

	// As of FFXIV plugin v1.4.2.24 (released for patch 3.5), ACT/OverlayPlugin seems to be sending ticks of data out of combat when buffs/friendly heals (inc. HoTs) are recieved, causing the graph to draw ugly straight lines when it shouldn't.
	// This is a pretty horrible fix, but it seems to be accurate enough, as the encounter timer doesn't get updated when this happens. (Using large margin of error as DURATION is somewhat inaccurate).
	if (Math.abs((dur / 1000) - enc.DURATION) > 1.5) {
		return false;
	}


	this.duration = dur;
	this.encounter = enc;
	this.data.push({
		time: this.duration,
		combatants: detail.Combatant
	});

	return true;
}

Encounter.prototype.updateEncounter = function(encounter) {
	this.encounter = encounter;
}

Encounter.prototype.sinceFor = function(since, stat) {
	var data = [];

	// Loop backwards to reduce processing
	for (var i = this.data.length - 1; i >= 0 && this.data[i].time >= since; i--) {
		var index = data.push({
			time: this.data[i].time,
			combatants: {}
		}) - 1;

		for (var name in this.data[i].combatants) {
			var combatant = this.data[i].combatants[name];
			data[index].combatants[this.getKey(combatant)] = parseFloat(combatant[stat]);
		}
	}

	// Reverse the array back into the right order
	return data.reverse();
}

Encounter.prototype.allFor = function(stat) {
	return this.sinceFor(0, stat);
}

Encounter.prototype.latestFor = function(stat) {
	return this.sinceFor(this.duration, stat)[0].combatants;
}

Encounter.prototype.getCombatant = function(key) {
	// Destructuring was only added in chrome 49 ;_;
	var split = key.split('|')
	  , name = split[0]
	  , job = split[1]
	  ;

	for (var i = this.data.length - 1; i >= 0; i--) {
		var combatants = this.data[i].combatants;
		if ((name in combatants) && job === combatants[name].Job) {
			return combatants[name];
		}
	}

	return {};
}

Encounter.prototype.getKey = function(combatant) {
	return combatant.name + '|' + combatant.Job;
}

Encounter.prototype.getEncounterName = function() {
	var rawSeconds = Math.round(this.duration / 1000)
	  , minutes = Math.floor(rawSeconds / 60)
	  , seconds = (rawSeconds % 60).toString()
	  , time = minutes + ':' + '00'.substring(0, 2 - seconds.length) + seconds
	  ;

	return this.encounter.title + ' - ' + time;
}
