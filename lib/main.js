
var config = {
	stat: 'encdps',
	window: 180, // seconds
	opacity: 0.75,
	labelTextSize: 10
};

var graph = new Graph('graph');
$('#graph').css('opacity', config.opacity);

var last = {
	zone: '',
	duration: Infinity
};

function update(event) {
	var enc = event.detail.Encounter;
	var cbs = event.detail.Combatant;
	var time = parseInt(enc.DURATION);

	// New encounter, reset.
	if (last.zone !== enc.CurrentZoneName
		|| last.duration > time
	) {
		last.zone = enc.CurrentZoneName;
		graph.reset();
	}

	// Ignore entries less than a GCD of time, they tend to have absurd dps due to the tiny duration
	if (time <= 2) {
		graph.render();
		return;
	}

	// Form up the data, creating series as required
	var data = {};
	for (var name in cbs) {
		var combatant = cbs[name];
		data[graph.getCombatantKey(combatant)] = parseFloat(combatant[config.stat]);

		if (!graph.seriesExists(combatant)) {
			graph.addSeries(combatant);
		}
	}

	// If there's no data, just jump out now
	if (Object.keys(data).length === 0) {
		return;
	}

	// Add the data to the graph to be rendered
	graph.addData(time, data);


	// Store the new duration and render the grpah
	last.duration = time;
	graph.render();
}

// Listen for incoming event
document.addEventListener('onOverlayDataUpdate', update);
document.addEventListener('message', function(event) {
	if (event.data.type == 'onOverlayDataUpdate') {
		update(event);
	}
});

// Make graph fill the full area
function onResize() {
	graph.configure({
		width: window.innerWidth - 50,
		height: window.innerHeight
	});
}
window.addEventListener('resize', onResize);
onResize();

/*

11/01/2017 7:00:40 PM: Info: Test: BrowserConsole: Uncaught stacked series cannot have differing numbers of points: 134 vs 115; see Rickshaw.Series.fill() (Source: file:///C:/Users/Okabe/Documents/code/ffxivparser/rickshaw.min.js, Line: 1)


*/
