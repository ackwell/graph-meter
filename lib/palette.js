
/*
 * Colour handling
 */
function Palette() {
	this.map = {
		ACN: '#2D9B78',
		SMN: '#2D9B78',

		THM: '#A579D6',
		BLM: '#A579D6',

		ARC: '#91ba5e',
		BRD: '#91ba5e',

		MCH: '#6EE1D6',

		PGL: '#d69c00',
		MNK: '#d69c00',

		ROG: '#AF1964',
		NIN: '#AF1964',

		LNC: '#4164CD',
		DRG: '#4164CD',

		MRD: '#cf2621',
		WAR: '#cf2621',

		GLD: '#A8D2E6',
		PLD: '#A8D2E6',

		DRK: '#EF8618',

		CNJ: '#FFF0DC',
		WHM: '#FFF0DC',

		SCH: '#8657FF',

		AST: '#FFE74A',

		// other stuff seems to be reported as blank
		'': '#2599be'
	};
}

Palette.prototype.color = function(combatant) {
	var job = combatant.Job.toUpperCase();

	if (job in this.map) {
		return this.map[job];
	} else {
		console.log(job);
	}
}

Palette.prototype.icon = function(combatant) {
	// TODO: All the other icons. Just handling the easy shit, it's fucking 4am.
	var file = 'error'
	  , job = combatant.Job.toLowerCase()
	  , name = combatant.name
	  ;

	if (job) {
		file = job;
	} else if (name == 'Limit Break') {
		file = 'limit break';
	}

	return 'img/class/' + file + '.png';
}
