# Tilted

Tilted is a lightweight TS library for displaying game maps and other content in a modern way.
Here's [live example](https://anbeeld.github.io/Tilted) via GitHub Pages.

## Features

- Works with any content, all visual modifications are done through CSS transform.
- Smooth scaling, animated with CSS transition.
- Content perspective depends on how close you look at it, getting more and more, well, *tilted*.
- Dragging functionality with limits so the content don't move off screen.
- Changing scaling with mouse wheel glides the content towards the cursor, animated with pure JS/TS.
- Everything is plenty configurable.

## Installation

`npm i tilted` or grab [JS dist file](https://github.com/Anbeeld/tilted/dist) from GitHub repo.

## Usage

`import Tilted from 'tilted'` if using npm
`new Tilted(container, surface, config?)`

`surface` is HTML element with content, and `container` is HTML element used to determine viewport size that has `surface` as a child. Fixed width and height are preferred for both.

`config` is an object that allows to change various constants related to scaling, animations, controls etc., see `config` file in source code.
