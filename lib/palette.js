
/*
 * Colour handling
 */
function Palette() {
	this.map = {
		SMN: '#2D9B78',
		MCH: '#6EE1D6',
		MNK: '#d69c00',
		BLM: '#A579D6',
		NIN: '#AF1964',
		DRG: '#4164CD',
		BRD: '#91ba5e',
		WAR: '#cf2621',
		DRK: '#EF8618',
		PLD: '#A8D2E6',
		SCH: '#8657FF',
		AST: '#FFE74A',
		WHM: '#FFF0DC',

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
