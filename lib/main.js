
window.config = {
	stat: 'encdps',
	window: 180 * 1000, // milliseconds
	opacity: 0.75,
	labelTextSize: 11,
	historyLength: 10
};

window.data = new Data();
window.palette = new Palette();

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
