
// If controls are disabled, hide the markup and don't bother setting up hooks etc
if (!config.showControls) {
	$('.controls').hide();
} else {

// Controls
$(function() {

	// Set up tabs
	$('.tabs li').click(function() {
		var $this = $(this)
		  , justHide = $this.hasClass('active');

		// Hide existing tabs
		$('.tabs li').removeClass('active');
		$('.tab-content').hide();

		if (!justHide) {
			var tab = $this.addClass('active').data('tab');
			$('.tab-content[data-tab=' + tab + ']').show();
		}
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

} // END if !config.showControls
