import { mouseMove, mouseWheel, mouseDown } from './mouse.js';
import { buttonPressed } from './keyboard.js';
import Surface from '../surface.js';
import { initDrag } from './drag.js';

export function initControls(surface: Surface) : void {
  surface.elements.container.addEventListener("mousemove", (e) => {mouseMove(e, surface);});
  surface.elements.container.addEventListener("wheel", (e) => {mouseWheel(e, surface);});

  initDrag(surface);

  surface.elements.container.addEventListener("mousedown", (e) => {mouseDown(e, surface);});
  surface.elements.container.addEventListener("touchstart", (e) => {mouseDown(e, surface);});

  document.body.addEventListener("keydown", (e) => {buttonPressed(e, surface);});

  surface.elements.controlsZoomIn.addEventListener("click", () => {surface.scale.stepAndGlide(1);});
  surface.elements.controlsZoomOut.addEventListener("click", () => {surface.scale.stepAndGlide(-1);});

  surface.elements.container.ondragstart = () => {
    return false;
  };
}