[![NPM](https://img.shields.io/npm/v/tilted?label=NPM)](https://www.npmjs.com/package/tilted)

# Tilted

Tilted is a lightweight TS library for displaying game maps and other content in a modern way.

Live demo is available [on my website](https://anbeeld.com/tilted).

[![Support my work!](https://anbeeld.com/images/support.jpg)](https://anbeeld.com/support)

## Features

- Works with any content, all visual modifications are done through CSS transform.
- Smooth scaling with the content gliding towards the cursor, animated with pure JS/TS.
- Content perspective depends on how close you look at it, getting more and more, well, *tilted*.
- Dragging functionality with limits so the content don't move off screen.
- Everything is plenty configurable.

## Installation

`npm i tilted` or grab [JS dist file](https://github.com/Anbeeld/Tilted/tree/main/dist) from GitHub repo.

## Usage

`import Tilted from 'tilted'` if using npm

`new Tilted(container, surface, config?)`

`surface` is HTML element with content, and `container` is HTML element used to determine viewport size that has `surface` as a child. Fixed width and height are preferred for both.

`config` is an object that allows to change various constants related to scaling, animations, controls etc., see `config` file in source code.
