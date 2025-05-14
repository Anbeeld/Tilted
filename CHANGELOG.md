## 0.4.5

- Fixed some content properties being ignored.
- Shielding from property mangling is now applied by using getProperty and setProperty utility functions.

## 0.4.4

- Renamed Entity into Content to avoid confusion with various other systems using this word.
- Renamed CSS element classes.
- Fixed various issues with build and test configuration.

## 0.4.3

- Animations now use the timestamp of requestAnimationFrame() instead of performance.now(), which seems to improve performance.
- Added Vitest to start the process of covering the library with unit tests.
- Exported index class is now separate from the Surface class, allowing to specifically define methods available to the users without interfering with public ones that are meant to be used inside the library only.
- Added setters where getters were already defined.
- Removed underscore prefixes from private property and method names, except for properties behind setters and getters.
- Changed type structure of CSS transform properties in the Surface class.
- Webpack minimizing config now affects all property names, except the ones starting with $, which can be used as a form of shielding.
- Removed debug mode.
- Various small fixes.

## 0.4.2

- Replaced approximate glide distance when zooming with actual calculations of the surface coordinates that the cursor points to now and will point after zooming. Perspective changes due to surface rotating are not taken into the account yet, but this may be added in the future updates.
- Fixed the map gliding back and forth on a hyperbola when zooming, caused by the movement being linear in absolute terms and thus having varying distance traveled per time relative to the viewport, by adjusting the glide step move based on the current map scale.

## 0.4.1

- Removed Raoi dependency, replacing it with a simpler object register baked into the lib itself.

## 0.4.0

- Added entity system, allowing to easily create 2.5D graphics. Add specific elements you want to mark as entity (type: figure) or a container with them (type: scene). These elements won't get tilted when scaling like a surface does, but will stay "straight" instead, creating simple multi-dimensional visuals out of angled 2D assets. You can also make them tilt along with surface, but at different angle (factor: !==1).
- Realized my scaling step sizes are a complete nonsense that silently stayed as is since the early draft. Reworked them into a logarithmic function, where every next step makes surface smaller or larger by the same percent. You can still set scaleMin and scaleMax, but scaleStep is replaced with scaleNumSteps, and scaleDefault with scaleDefaultStep. Step sizes are then calculated under the hood.
- All children of container element (which are usually siblings of surface element) are now appended to transform element during initialization.
- Provided comments for all config values with brief explanations of their meaning.
- Renamed all config values with multiplier behaviour to somethingFactor.
- Renamed throw to toss, avoiding confusion with throw as error handling.
- Toss glide vector is now divided by scaling value, and tossGlideFactor default config value is set to 1.
- Renamed rotateXMax and rotateRounding config values to tiltMax and tiltRounding respectively, added tiltMin config value to allow making the surface tilted at any scale value.
- Split perspectiveDistance into perspectiveValue and perspectiveFactor, changed default perspectiveValue from 600px to 750px, moved perspective CSS update into Surface class from Scale.
- Changed class naming from "tilted-element-ID" to "tilted-ID-element".
- Replaced "image" example with a much fancier "world-map" one that makes use of the entity system.
- Renamed "html" example to "tile-map", added examples of the entity system usage to it.
- Added "elemap" example that uses my other library of the same name.

## 0.3.0

- New zooming implementation with variable animation time depending on how much the scale is going to change.
- Fixed rapid zooming in and out without moving mouse cursor resulting in different surface position after returing to the initial scale.
- Fixed other small issues related to zooming, like jagginess around certain scales.
- Merged scale and position into one element named transform, with all transform CSS moved to this element.
- All changes related to visuals are now tied to frame update.
- Replaced rotate3d with rotateX.
- User-provided config is now camelCase.
- Merged multiple scale rounding config values into one.
- Added rotate rounding config value.
- Moved everything related to surface position into a separate class.
- Added a layer of abstraction methods for animation storage.
- Creation of animation now initializes executor by itself.
- Resolved conflicts between glide and edge animations.
- Adjusted minifying strategy to mangle everything starting with uppercase.
- Replaced direct importing and references to surface in classes with Raoi ids.
- Updated HTML example visuals and element structure.

## 0.2.0

- Reworked scale CSS transitions into JS animations to allow for higher degree of control.
- Moved easing of all animations to easeOutCirc.
- Made animations faster by default.
- Removed bezier-easing dependency.
- Fixed sequential glides interrupting previous ones, leading to inconsisted surface move when scaling.
- Fixed positive and negative scale step having different glide distance, leading to surface not returning to the same spot after scaling it up and down without changing mouse position.
- Fixed many small issues with move and scale functions.
- Updated naming to non-public being underscored.
- New cross-library Webpack minimizing config, resulting in a much smaller dist file.

## 0.1.3

- Fixed examples leaking into npm.

## 0.1.2

- Swapped uuid for in-house Raoi library.
- Changed TS config to a stricter one and compilation target from es2017 to es2015.

## 0.1.1

- Fixed TouchEvent check on Firefox.

## 0.1.0

- Initial release.