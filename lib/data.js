
function Data() {
	this.graph = new Graph();
	this.encounter = null;
}

Data.prototype.push = function(detail) {
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
	this.combatants = {};
}

Encounter.prototype.isNewEncounter = function(detail) {
	return this.encounter.CurrentZoneName !== detail.Encounter.CurrentZoneName ||
		this.encounter.DURATION > detail.Encounter.DURATION;
}

Encounter.prototype.push = function(detail) {
	this.encounter = detail.Encounter;
	this.combatants = detail.Combatant;
	this.lastUpdate = new Date().getTime();
	this.duration = this.lastUpdate - this.start;
}

Encounter.prototype.latestFor = function(stat) {
	var data = {};
	for (var name in this.combatants) {
		var combatant = this.combatants[name];
		data[this.getKey(combatant)] = parseFloat(combatant[config.stat]);
	}
	return data;
}

Encounter.prototype.getCombatant = function(key) {
	var split = key.split('|');
	return this.combatants[split[0]];
}

Encounter.prototype.getKey = function(combatant) {
	return combatant.name + '|' + combatant.Job;
}
