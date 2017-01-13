
function Axis(graph) {
	this.graph = graph;
}

Axis.prototype.render = function() {
	// Y axis test
	$('.y-axis .label').hide();
	// Draw a label for each active series
	for (var i = 0; i < this.graph.series.length; i++) {
		var series = this.graph.series[i]
		  , latestStack = series.stack[series.stack.length - 1]
		  ;

		// If the latest Y is 0, don't bother drawing a label - it's inactive
		if (latestStack.y === 0) {
			continue;
		}

		// Grab the label, making one if it doesn't exist
		var className = series.name.replace(/\s+/g, '-')
		  , label = $('.y-axis .label.' + className)
		  , shortName = this.getShortName(series.name)
		  ;

		if (label.length == 0) {
			label = $('<div class="label ' + className + '"></div>')
				.text(shortName)
				.appendTo('.y-axis')
				;
		}

		// Work out the new position and set the label to go
		var value = this.graph.height - this.graph.y(latestStack.y0 + latestStack.y);
		label.css('bottom', value).show();
	}
}

Axis.prototype.getShortName = function(name) {
	name = name.toLowerCase();

	// Piss about with the name for display
	if (name == 'you') {
		name = 'You';

	} else if (name == 'limit break') {
		name = 'LB';

	} else {
		name = name
			.split(' ')
			.map(function(word) { return word[0].toUpperCase(); })
			.join('. ') + '.';
	}

	return name;
}
