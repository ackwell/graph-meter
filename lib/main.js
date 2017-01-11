
var config = {
	stat: 'encdps',
	window: 180 // seconds
};

/*
 * Graph Handler
 */
// Constructor
function Graph(id) {
	this.series = [];
	this.map = {}

	this.graph = new Rickshaw.Graph({
		element: document.getElementById(id),
		width: 350,
		height: 200,
		renderer: 'area',
		interpolation: 'linear',
		// offset: 'wiggle',
		stroke: true,
		preserve: true,
		series: this.series
	});
}

Graph.prototype.addData = function(time, data) {
	var seriesLength = this.series[0].data.length;

	if (time === this.series[0].data[seriesLength - 1].x) {
		// If the time hasn't changed (ACT does that sometimes), update the existing node
		for (var name in data) {
			var combatantSeries = this.series[this.map[name]].data;
			combatantSeries[combatantSeries.length - 1].y = parseFloat(data[name]);
		}
	} else {
		// Otherwise, add a new node, and cull until we're at a reasonable length
		for (var name in this.map) {
			var combatantIndex = this.map[name];

			// Add new data
			this.series[combatantIndex].data.push({
				x: time,
				y: (name in data)? parseFloat(data[name]) : 0
			});

			// Cull old stuff outside the window
			for (var i = 0; i < this.series[combatantIndex].data.length; i++) {
				if (this.series[combatantIndex].data[i].x >= time - config.window) {
					break;
				}

				this.series[combatantIndex].data.shift();
			}
		}
	}
}

Graph.prototype.seriesExists = function(name) {
	return this.map[name] !== undefined;
}

Graph.prototype.addSeries = function(name, color) {
	var data = [];
	var seriesData = null;

	if (!this.series.length) {
		// We don't have any series yet, build the first and pre-fill with blank data
		for (var i = -config.window; i < 0; i++) {
			data.push({
				x: i,
				y: 0
			});
		}
	} else if ((seriesData = this.series[0].data).length) {
		for (var i = 0; i < seriesData.length; i++) {
			data.push({
				x: seriesData[i].x,
				y: 0
			});
		}
	}

	this.map[name] = this.series.push({
		name: name,
		color: color,
		data: data
	}) - 1;
}

Graph.prototype.render = function() {
	this.graph.render();
}

Graph.prototype.configure = function(options) {
	this.graph.configure(options);
	this.render();
}

Graph.prototype.reset = function() {
	this.series.length = 0;
	this.map = {};
}

var graph = new Graph('chart');

var palette = new Rickshaw.Color.Palette({scheme: 'classic9'});

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
		data[name] = parseFloat(cbs[name][config.stat]);

		if (!graph.seriesExists(name)) {
			graph.addSeries(name, palette.color());
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

// Temp: Record data for debug playback
var record = [];
function updateRecordData(event) {
	record.push(event.detail);
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
		width: window.innerWidth,
		height: window.innerHeight - 20
	});
}
window.addEventListener('resize', onResize);
onResize();

/*

11/01/2017 7:00:40 PM: Info: Test: BrowserConsole: Uncaught stacked series cannot have differing numbers of points: 134 vs 115; see Rickshaw.Series.fill() (Source: file:///C:/Users/Okabe/Documents/code/ffxivparser/rickshaw.min.js, Line: 1)


*/
