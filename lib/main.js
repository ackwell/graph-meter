
var config = {
	stat: 'encdps',
	window: 180 * 1000, // milliseconds
	opacity: 0.75,
	labelTextSize: 11
};

var data = new Data();
var palette = new Palette();

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
   * Stat switcher
   */
	// Set the stat heading to the current stat
	$('.tabs [data-tab=stat]').text($('.stats [data-stat=' + config.stat + ']').text());

	// Switch visible stat on selection
	$('.stats li').click(function() {
		var $this = $(this);
		// TODO:
		// data.switchStat($this.data('stat'));
		$('.tabs [data-tab=stat]').text($this.text()).removeClass('active');
		$this.closest('.tab-content').hide();
	});
});
