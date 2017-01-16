
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
