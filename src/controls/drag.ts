import Surface from '../surface.js';
import { getMouseParams } from '../controls/mouse.js';
import { Animations } from '../animation/storage.js';

export function initDrag(surface: Surface) {
  function moveToDrag(event: MouseEvent|TouchEvent) : void {
    if (surface.animationStorage.exists(Animations.SurfaceDrag)) {
      surface.animationStorage.surfaceDrag!.step(getMouseParams(event, surface));
    }
  }

  surface.elements.container.addEventListener('mousemove', moveToDrag);
  surface.elements.container.addEventListener('touchmove', moveToDrag);

  function clearSurfaceDrag() : void {
    surface.animationStorage.destroy(Animations.SurfaceDrag);
  }

  document.body.addEventListener('mouseup', clearSurfaceDrag);
  document.body.addEventListener('touchend', clearSurfaceDrag);
}