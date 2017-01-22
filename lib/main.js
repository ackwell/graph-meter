
var config = {
	stat: 'encdps',
	window: 180 * 1000, // milliseconds
	opacity: 0.75,
	labelTextSize: 11,
	historyLength: 9
};

var data = new Data();
var palette = new Palette();

data.switchStat(config.stat);

function update(event) {
	data.push(event.detail);
}

// Listen for incoming event
document.addEventListener('onOverlayDataUpdate', update);
document.addEventListener('message', function(event) {
	if (event.data.type == 'onOverlayDataUpdate') {
		update(event);
	}
});

// Controls
$(function() {

	// Set up tabs
	$('.tabs li').click(function() {
		var tab = $(this).toggleClass('active').data('tab');
		$('.tab-content[data-tab=' + tab + ']').toggle();
	});

	/*
	 * Encounter Switcher
	 */
	$('.encounters').on('click', 'li', function() {
		var $this = $(this);

		var encounter = $this.data('encounter');
		if (encounter !== 'current') { encounter = parseInt(encounter, 10); }
		data.switchEncounter(encounter);

		$('.tabs [data-tab=encounter]').text($this.text()).removeClass('active');
		$this.closest('.tab-content').hide();
	});

	/*
   * Stat switcher
   */
	// Set the stat heading to the current stat
	$('.tabs [data-tab=stat]').text($('.stats [data-stat=' + config.stat + ']').text());

	// Switch visible stat on selection
	$('.stats li').click(function() {
		var $this = $(this);

		var stat = $this.data('stat');
		config.stat = stat;
		data.switchStat(stat);

		$('.tabs [data-tab=stat]').text($this.text()).removeClass('active');
		$this.closest('.tab-content').hide();
	});
});

// This will be moved out when config gets moved out
function updateHistoryControls(encounters) {
	// Create a new list of encounters
	var $encounters = $('.encounters');
	$encounters.find('li').remove();
	for (var i = 0; i < encounters.length; i++) {
		var enc = encounters[i];
		$('<li data-encounter="' + enc.index + '">' + enc.name + '</li>').appendTo($encounters);
	}

	// Set the tab to the first (newest) encounter)
	$('.tabs [data-tab=encounter]').text(encounters[0].name)
}
