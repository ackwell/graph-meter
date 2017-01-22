
/*
 * Graph Handler
 */
// Constructor
function Graph() {
	this.cullOld = true;

	this.series = [];
	this.map = {};

	// Create the graph
	this.graph = new Rickshaw.Graph({
		element: document.getElementById('graph'),
		width: 350,
		height: 200,
		renderer: 'area',
		interpolation: 'linear',
		// offset: 'wiggle',
		stroke: true,
		preserve: true,
		series: this.series
	});
	$('#graph').css('opacity', config.opacity);

	// Set up the axis and theme
	this.axis = new Axis(this.graph);

	// Set up a resize handler and do an initial call
	$(window).resize(function() {
		this.graph.configure({
			width: window.innerWidth - 50,
			height: window.innerHeight - 20
		});
		this.render();
	}.bind(this)).resize();
}

Graph.prototype.set = function(data) {
	this.reset();
	for (var i = 0; i < data.length; i++) {
		this.push(data[i].time, data[i].combatants);
	}
}

Graph.prototype.push = function(time, data) {
	// Make sure we've got series for everyone
	for (var key in data) {
		if (!this.seriesExists(key)) {
			this.addSeries(key);
		}
	}

	// Load the new data in. Looping over the map so I don't end
	// up with uneven point counts, rickshaw doesn't like that.
	for (var key in this.map) {
		var combatantSeries = this.map[key].data;

		// Add new data to the series
		combatantSeries.push({
			x: time,
			y: (key in data)? parseFloat(data[key]) : 0
		});

		if (this.cullOld) {
			this.cullOldData(time, combatantSeries);
		}
	}

	// Sort the series
	this.series.sort(function(a, b) {
		return a.data[a.data.length - 1].y - b.data[b.data.length - 1].y;
	});
}

Graph.prototype.cullOldData = function(time, data) {
	// Hold on to the last shift in case we need to interpolate
	var lastShift = {};

	for (var i = 0; i < data.length; i++) {
		if (data[i].x >= time - config.window) {
			break;
		}

		lastShift = data.shift();
	}

	// If the oldest data point is earlier than our window,
	// we need to interpolate to prevent it screwing up the scale
	if (data[0].x > time - config.window) {
		data.unshift({
			x: time - config.window,
			y: lastShift.y - (lastShift.y - data[0].y) / (data[0].x - lastShift.x)
		});
	}
}

Graph.prototype.getFirstTime = function() {
	if (!this.series.length || !this.series[0].data.length)  {
		return 0;
	}

	return this.series[0].data[0].x;
}

Graph.prototype.seriesExists = function(key) {
	return this.map[key] !== undefined;
}

Graph.prototype.addSeries = function(key) {
	var data = []
	  , seriesData = null
	  ;

	if (!this.series.length) {
		// We don't have any series yet, build the first and pre-fill with blank data
		if (this.cullOld) {
			for (var i = -(config.window/1000); i < 0; i++) {
				data.push({
					x: i,
					y: 0
				});
			}
		}
	} else if ((seriesData = this.series[0].data).length) {
		for (var i = 0; i < seriesData.length; i++) {
			data.push({
				x: seriesData[i].x,
				y: 0
			});
		}
	}

	this.map[key] = {
		name: key,
		color: window.palette.color(window.data.getCombatant(key)),
		data: data
	};

	this.series.push(this.map[key]);
}

Graph.prototype.render = function() {
	this.graph.render();
	this.axis.render();
}

Graph.prototype.reset = function() {
	this.series.length = 0;
	this.map = {};
	this.axis.reset();
}
