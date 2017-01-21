
function Data() {
	this.graph = new Graph();
	this.encounter = null;

}

Data.prototype.push = function(detail) {
	// Parse the duration field now so I don't have to think about it later
	detail.Encounter.DURATION = parseInt(detail.Encounter.DURATION);

	// New encounter, reset the graphs and make a new encounter object to track everything
	if (!this.encounter || this.encounter.isNewEncounter(detail)) {
		this.encounter = new Encounter(detail);
		this.graph.reset();
	}

	var success = true;

	// Only push active details, inactive are the same as the last active, and just fuck up the timing.
	if (detail.isActive) {
		success = this.encounter.push(detail);
	}

	// If adding the data failed for some reason, just re-render the graph.
	if (!success) {
		this.graph.render();
		return;
	}

	// If isActive is false, the encounter has ended. Update the graph with a full view of the encounter
	if (!detail.isActive) {
		this.graph.cullOld = false;
		this.graph.set(this.encounter.allFor(config.stat));

	} else {
		this.graph.cullOld = true;
		this.graph.push(this.encounter.duration, this.encounter.latestFor(config.stat));
	}

	this.graph.render();
}

Data.prototype.getCombatant = function(key) {
	return this.encounter.getCombatant(key);
}


function Encounter(detail) {
	this.start = new Date().getTime();
	this.duration = 0;

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

Encounter.prototype.allFor = function(stat) {
	var data = [];

	for (var i = 0; i < this.data.length; i++) {
		data.push({
			time: this.data[i].time,
			combatants: {}
		});

		for (var name in this.data[i].combatants) {
			var combatant = this.data[i].combatants[name];
			data[i].combatants[this.getKey(combatant)] = parseFloat(combatant[config.stat]);
		}
	}

	return data;
}

Encounter.prototype.latestFor = function(stat) {
	var data = {}
	  , combatants = this.data[this.data.length - 1].combatants
	  ;

	for (var name in combatants) {
		var combatant = combatants[name];
		data[this.getKey(combatant)] = parseFloat(combatant[config.stat]);
	}

	return data;
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
