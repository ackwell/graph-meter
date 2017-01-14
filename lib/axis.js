
function Axis(graph) {
	this.graph = graph;
}

Axis.prototype.render = function() {
	var labels = {};

	// Get the data for the labels, and jiggle them into position
	var lastBottom = this.graph.height;
	var breathingRoom = 0;
	for (var i = this.graph.series.length - 1; i >= 0; i--) {
		var series = this.graph.series[i]
		  , latestStack = series.stack[series.stack.length - 1]
		  ;

		// If the latest Y is 0, don't bother drawing a label - it's inactive
		if (latestStack.y === 0) {
			continue;
		}

		// Work out the new position
		var value = this.graph.height - this.graph.y(latestStack.y0 + latestStack.y);

		if ((value + 10) > lastBottom) {
			value = lastBottom - 10
		}
		breathingRoom += lastBottom - (value + 10);
		lastBottom = value - 10;

		// Set the data we'll work with
		labels[series.key] = {
			class: series.key.toLowerCase().replace(/\s+/g, '-'),
			short: this.getShortName(series.name),
			icon: series.icon,
			value: this.getShortNumber(latestStack.y),
			position: value
		};
	}

	// Travel back up the series in case we've extended too far down
	var lastTop = 0;
	for (var i = 0; i < this.graph.series.length - 1; i++) {
		var series = this.graph.series[i]
		  , label = labels[series.key]
		  ;

		// No label, must be empty or something. Ignore.
		if (!label) { continue; }

		// We've reached the first blank space, so everything must be in-place.
		if ((label.position - 10) > lastTop) { break; }

		// Work out how far to move the label up to keep it on screen,
		// being mindful of the space we've got to work with.
		var moveUp = lastTop - (label.position - 10);
		if (lastTop == 0) {
			moveUp = Math.min(moveUp, breathingRoom);
		}

		label.position += moveUp;
		lastTop = label.position + 10;
	}

	// Render the labels
	$('.y-axis .label').hide();

	for (var key in labels) {
		var label = labels[key]
		  , el = $('.y-axis .label.' + label.class)
		  ;

		// Create a new label if there's none to work with
		if (el.length == 0) {
			el = $([
				'<div class="label ' + label.class + '">',
					'<img src="' + label.icon + '">',
					'<div class="text">',
						label.short + '<br><span class="value">&nbsp;</span>',
					'</div>',
				'</div>',
			].join('')).appendTo('.y-axis');
		}

		// Set position and value, then show the label
		el.css('bottom', label.position);
		el.find('.value').text(label.value);
		el.show();
	}
}

Axis.prototype.reset = function() {
	$('.y-axis .label').remove();
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

Axis.prototype.getShortNumber = function(n) {
	with (Math) {
		n = round(n);

		var base = floor(log(abs(n))/log(1000))
		  , suffix = 'kMGT'[base - 1] // as if we'll get that high
		  ;

		// If we're using a suffix, round to 1 dec place
		if (suffix) {
			n = String(round((n / pow(1000, base)) * 10) / 10).substring(0, 3) + suffix;
		}

		return n;
	}
}
