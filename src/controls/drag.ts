import Surface from '../index.js';
import { MouseParams, getMouseParams } from '../controls/mouse.js';

export function initDrag(surface: Surface) {
  function moveToDrag(event: MouseEvent|TouchEvent) : void {
    if (surface.animationStorage.surfaceDragIsSet()) {
      surface.animationStorage.surfaceDrag!.step(getMouseParams(event, surface));
    }
  }

  surface.elements.container.addEventListener('mousemove', moveToDrag);
  surface.elements.container.addEventListener('touchmove', moveToDrag);

  function clearSurfaceDrag() : void {
    surface.animationStorage.destroySurfaceDrag();
  }

  document.body.addEventListener('mouseup', clearSurfaceDrag);
  document.body.addEventListener('touchend', clearSurfaceDrag);
}