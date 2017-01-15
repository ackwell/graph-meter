
function Axis(graph) {
	this.graph = graph;
}

Axis.prototype.render = function() {
	var labels = {};
	var textSize = config.labelTextSize;

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

		if ((value + textSize) > lastBottom) {
			value = lastBottom - textSize
		}
		breathingRoom += lastBottom - (value + textSize);
		lastBottom = value - textSize;

		// Set the data we'll work with
		labels[series.key] = {
			class: series.key.toLowerCase().replace(/(\W)+/g, '-'),
			display: series.display,
			value: this.getShortNumber(latestStack.y),
			position: value
		};
	}

	// Travel back up the series in case we've extended too far down
	var lastTop = 0;
	for (var i = 0; i < this.graph.series.length; i++) {
		var series = this.graph.series[i]
		  , label = labels[series.key]
		  ;

		// No label, must be empty or something. Ignore.
		if (!label) { continue; }

		// We've reached the first blank space, so everything must be in-place.
		if ((label.position - textSize) > lastTop) { break; }

		// Work out how far to move the label up to keep it on screen,
		// being mindful of the space we've got to work with.
		var moveUp = lastTop - (label.position - textSize);
		if (lastTop == 0) {
			moveUp = Math.min(moveUp, breathingRoom);
		}

		label.position += moveUp;
		lastTop = label.position + textSize;
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
					'<img src="' + label.display.icon + '">',
					'<div class="text">',
						label.display.shortName + '<br><span class="value">&nbsp;</span>',
					'</div>',
				'</div>',
			].join('')).appendTo('.y-axis');

			// Set dynamic sizes as req.
			el.css({
				height: textSize * 2,
				marginBottom: -textSize
			});
			el.find('img').css({
				width: textSize * 2,
				height: textSize * 2
			});
			el.find('.text').css({
				fontSize: textSize,
				lineHeight: textSize + 'px'
			})
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
