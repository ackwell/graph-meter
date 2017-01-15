
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

	this.encounter.push(detail);

	// Ignore entries with less than a GCD of time, they tend
	// to have absurd stats due to the tiny duration
	if (this.encounter.duration <= 2000) {
		this.graph.render();
		return;
	}

	this.graph.push(this.encounter.duration, this.encounter.latestFor(config.stat));

	this.graph.render();
}

Data.prototype.getCombatant = function(key) {
	return this.encounter.getCombatant(key);
}


function Encounter(detail) {
	this.start = new Date().getTime();
	this.lastUpdate = 0;
	this.duration = 0;

	this.encounter = detail.Encounter;
	this.data = [];
}

Encounter.prototype.isNewEncounter = function(detail) {
	return this.encounter.CurrentZoneName !== detail.Encounter.CurrentZoneName ||
		this.encounter.DURATION > detail.Encounter.DURATION;
}

Encounter.prototype.push = function(detail) {
	this.encounter = detail.Encounter;
	this.data.push(detail.Combatant);
	this.lastUpdate = new Date().getTime();
	this.duration = this.lastUpdate - this.start;
}

Encounter.prototype.latestFor = function(stat) {
	var data = {}
	  , combatants = this.data[this.data.length - 1]
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
		var combatants = this.data[i];
		if ((name in combatants) && job === combatants[name].Job) {
			return combatants[name];
		}
	}

	return {};
}

Encounter.prototype.getKey = function(combatant) {
	return combatant.name + '|' + combatant.Job;
}
