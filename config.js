
/*
The settings in this file should be enough for most use cases, I've included a
short description of what each one does. If you'd like to customise the overlay
a bit more, have a dig through the contents of lib/, particulary lib/palette.js.

If there's a setting you think should be moved into this file, drop a pull request
in (ackwell/graph-meter), or PM me on reddit (/u/ackwell) or Discord (ackwell#3835).
*/

window.config = {
	// Stat the graph should track. Valid values can be seen in the date export
	// from OverlayPlugin, or in the "data-stat" attributes in index.html
	stat: 'encdps',

	// The 'rolling' window of the graph when tracking a current encounter
	// The value is defined in milliseconds
	window: 180 * 1000,

	// Opacity of the graph itself. 0 = transparent, 1 = opaque.
	opacity: 0.75,

	// Number of encounters that should be remembered, including the current
	// encounter being tracked
	historyLength: 10,

	// Set to false to hide the right-hand axis with value outputs
	showAxis: true,

	// Font size to use for the axis labels. Class icons, etc. will be 2x this.
	axisTextSize: 11,

	// Width of the axis.
	axisWidth: 50,

	// Set to false to hide the drop-down menus. Note that doing this will
	// essentially lock the graph into using the stat defined above, and
	// only viewing the current encounter
	showControls: true
};
