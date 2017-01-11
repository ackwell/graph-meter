
/*
 * Graph Handler
 */
// Constructor
function Graph(id) {
	this.series = [];
	this.map = {};

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

			this.cullOldData(this.series[combatantIndex].data, time);
		}
	}
}

Graph.prototype.cullOldData = function(data, time) {
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

	// Y axis test
	$('.y-axis .label').hide();
	// Draw a label for each active series
	for (var i = 0; i < this.graph.series.length; i++) {
		var series = this.graph.series[i]
		  , latestStack = series.stack[series.stack.length - 1];

		// If the latest Y is 0, don't bother drawing a label - it's inactive
		if (latestStack.y === 0) {
			continue;
		}

		// Grab the label, making one if it doesn't exist
		var className = series.name.toLowerCase().replace(/\s+/g, '-')
		  , label = $('.y-axis .label.' + className)
		  ;

		if (label.length == 0) {
			label = $('<div class="label ' + className + '"></div>').appendTo('.y-axis');
		}

		// Work out the new position and set the label to go
		var value = this.graph.y.range()[0] - this.graph.y(latestStack.y0 + latestStack.y);
		label.css('bottom', value).show();
	}
}

Graph.prototype.configure = function(options) {
	this.graph.configure(options);
	this.render();
}

Graph.prototype.reset = function() {
	this.series.length = 0;
	this.map = {};
}
