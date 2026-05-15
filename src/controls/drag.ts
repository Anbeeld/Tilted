import Surface from '../surface.js';
import { getMouseParams } from '../controls/mouse.js';
import { Animations } from '../animation/storage.js';

export function initDrag(surface: Surface) : () => void {
  let cleanupFunctions: (() => void)[] = [];
  let listen = <K extends keyof DocumentEventMap>(target: Document | HTMLElement, event: K, listener: (event: DocumentEventMap[K]) => void) => {
    target.addEventListener(event, listener as EventListener);
    cleanupFunctions.push(() => {
      target.removeEventListener(event, listener as EventListener);
    });
  };

  function moveToDrag(event: MouseEvent|TouchEvent) : void {
    if (surface.animationStorage.exists(Animations.SurfaceDrag)) {
      surface.animationStorage.surfaceDrag!.step(getMouseParams(event, surface));
    }
  }

  listen(document, 'mousemove', moveToDrag);
  listen(document, 'touchmove', moveToDrag);

  function clearSurfaceDrag() : void {
    surface.animationStorage.destroy(Animations.SurfaceDrag);
  }

  listen(document, 'mouseup', clearSurfaceDrag);
  listen(document, 'touchend', clearSurfaceDrag);

  return () => {
    for (let cleanup of cleanupFunctions) {
      cleanup();
    }
    cleanupFunctions = [];
  };
}
