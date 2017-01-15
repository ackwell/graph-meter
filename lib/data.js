
function Data() {
	this.graph = new Graph();
	this.encounter = null;
}

Data.prototype.push = function(detail) {
	// console.log(detail.isActive);
	detail.Encounter.DURATION = parseInt(detail.Encounter.DURATION);

	if (!this.encounter || this.encounter.isNewEncounter(detail)) {
		this.encounter = new Encounter(detail);
		this.graph.reset();
	}

	// Only push active details, inactive are the same as the last active, and just fuck up the timing.
	if (detail.isActive) {
		this.encounter.push(detail);
	}

	// Ignore entries with less than a GCD of time, they tend to have absurd stats due to the tiny duration
	if (this.encounter.duration <= 2500) {
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
	this.duration = new Date().getTime() - this.start;

	this.encounter = detail.Encounter;
	this.data.push({
		time: this.duration,
		combatants: detail.Combatant
	});
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
