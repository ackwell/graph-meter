
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

	this.pets = {
		// ACN
		'Emerald Carbuncle': 'emerald',
		'Topaz Carbuncle': 'topaz',
		'Ruby Carbuncle': 'ruby',

		// SMN
		'Garuda-Egi': 'garuda',
		'Titan-Egi': 'titan',
		'Ifrit-Egi': 'ifrit',

		// SCH
		'Eos': 'eos',
		'Selene': 'selene',

		// MCH
		'Rook Autoturret': 'rook',
		'Bishop Autoturret': 'bishop'
	};
}

Palette.prototype.getDisplayData = function(combatant) {
	return {
		shortName: this.shortName(combatant),
		color: this.color(combatant),
		icon: this.icon(combatant)
	};
}

Palette.prototype.shortName = function(combatant) {
	var name = combatant.name.toLowerCase();

	// Piss about with the name for display
	if (name == 'you') {
		name = 'You';

	} else if (name == 'limit break') {
		name = 'LB';

	} else {
		name = name
			.replace(/ \(.+?\)$/, '')
			.split(' ')
			.map(function(word) { return word[0].toUpperCase(); })
			.join('. ') + '.';
	}

	return name;
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
	  , petCheck = name.match(/^(.+?) \((.+?)\)$/)
	  ;

	if (petCheck) {
		file = this.pets[petCheck[1]] || 'chocobo';

	} else if (job) {
		file = job;

	} else if (name == 'Limit Break') {
		file = 'limit break';
	}

	return 'img/class/' + file + '.png';
}
