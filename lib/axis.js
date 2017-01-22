
function Axis(graph) {
	this.graph = graph;
	$('.y-axis').css('width', config.axisWidth);
}

Axis.prototype.render = function() {
	var labels = {};
	var textSize = config.axisTextSize;

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

		// Prevent labels sitting on top of one another
		if ((value + textSize) > lastBottom) {
			value = lastBottom - textSize
		}

		// Keep track of how much empty space we're leaving
		breathingRoom += lastBottom - (value + textSize);
		lastBottom = value - textSize;

		// Set the data we'll work with
		labels[series.name] = {
			key: series.name,
			value: this.getShortNumber(latestStack.y),
			position: value
		};
	}

	// Travel back up the series in case we've extended too far down
	var lastTop = 0;
	for (var i = 0; i < this.graph.series.length; i++) {
		var series = this.graph.series[i]
		  , label = labels[series.name]
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
			, class_ = key.toLowerCase().replace(/(\W)+/g, '-')
		  , el = $('.y-axis .label.' + class_)
		  , display = window.palette.getDisplayData(window.data.getCombatant(key))
		  ;

		// Create a new label if there's none to work with
		if (el.length == 0) {
			el = $([
				'<div class="label ' + class_ + '">',
					'<img src="' + display.icon + '">',
					'<div class="text">',
						display.shortName + '<br><span class="value">&nbsp;</span>',
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

// Reset axis by removing all curtrent labels (to prevent a build-up over time)
Axis.prototype.reset = function() {
	$('.y-axis .label').remove();
}

// Format numbers into something slightly more sane to be shown on the axis
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
