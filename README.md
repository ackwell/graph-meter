Graph Meter
===

![Showcase](https://i.imgur.com/UMOzONH.gif)

Graph-based FFXIV overlay skin for ACT OverlayPlugin.

Features
---

* Retains history of past encounters
* Statistic being graphed can be switched on the fly
* Snazzy y-axis labels with icons
* It's a graph, what more do you want
* Oh it's also sorta configurable but only sorta
* Shit code that was primarily written late at night

Installation
---

1. [Download a zip release thingy](https://github.com/ackwell/graph-meter/archive/master.zip)
2. Extract it somewhere, location is unimportant. I'd recommend near any other skins you have.
3. In ACT, go to Plugins -> OverlayPlugin.dll, and click "New".
4. Give it a name, and make sure "Type" is set to "Mini Parse".
5. Click the "..." next to URL and select the `index.html` file that you extracted.
6. Move it into position and lock it!

Configuration
---

I'm way too lazy to make a nice config window like kagerou has, sorry. Pull requests, I guess?

To configure the overlay, open `config.js` in the same folder as the `index.html` from earlier, and edit the values there. You'll need to reload the overlay in the OverlayPlugin settings to see effects take place. `config.js` is commented with what the values do.

As mentioned in `config.js`, further config can be achieved by editing files in `lib/` such as `lib/palette.js`, but you'll want a half-decent understanting of JavaScript before diving in there.

Todo
---

In no particular order:

* [ ] Snazzy x-axis with timestamps and cool stuff!
* [ ] Pet splitting/joining (do people actually use this?)
* [ ] Better styling of controls, groupings for encounters and stats
* [ ] Config editing without editing a bloody text file

Reporting Bugs
---

Before reporting a bug, check if it looks like any of [these outputs](https://imgur.com/a/VSeBv). While frustrating, these are caused by ACT mistaking an enemy for an ally or visa versa (or both), and there's nothing I can do about it without trying to fudge data - I'd prefer not to.

That said, if you come across a bug, toss a pull request in, or raise an issue here on GitHub. Alternatively, message me on reddit (`/u/ackwell`), or PM me on Discord (`ackwell#3835`).
