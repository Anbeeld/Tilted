import { mouseMove, mouseWheel, mouseDown } from './mouse.js';
import { buttonPressed } from './keyboard.js';
import Surface from '../surface.js';
import { initDrag } from './drag.js';
import { Animations } from '../animation/storage.js';

export function initControls(surface: Surface) : () => void {
  let cleanupFunctions: (() => void)[] = [];
  let listen = <K extends keyof HTMLElementEventMap>(target: HTMLElement, event: K, listener: (event: HTMLElementEventMap[K]) => void, options?: AddEventListenerOptions) => {
    target.addEventListener(event, listener as EventListener, options);
    cleanupFunctions.push(() => {
      target.removeEventListener(event, listener as EventListener, options);
    });
  };
  let listenDocument = <K extends keyof DocumentEventMap>(event: K, listener: (event: DocumentEventMap[K]) => void) => {
    document.addEventListener(event, listener as EventListener);
    cleanupFunctions.push(() => {
      document.removeEventListener(event, listener as EventListener);
    });
  };

  let handleMouseMove = (e: MouseEvent) => {mouseMove(e, surface);};
  let handleMouseLeave = () => {surface.animationStorage.destroy(Animations.SurfaceEdge);};
  let handleWheel = (e: WheelEvent) => {mouseWheel(e, surface);};
  let handleMouseDown = (e: MouseEvent) => {mouseDown(e, surface);};
  let handleTouchStart = (e: TouchEvent) => {mouseDown(e, surface);};
  let handleKeyDown = (e: KeyboardEvent) => {buttonPressed(e, surface);};
  let handleZoomInClick = () => {surface.scale.stepAndGlide(1);};
  let handleZoomOutClick = () => {surface.scale.stepAndGlide(-1);};

  listen(surface.elements.container, "mousemove", handleMouseMove);
  listen(surface.elements.container, "mouseleave", handleMouseLeave);
  listen(surface.elements.container, "wheel", handleWheel, { passive: false });

  cleanupFunctions.push(initDrag(surface));

  listen(surface.elements.container, "mousedown", handleMouseDown);
  listen(surface.elements.container, "touchstart", handleTouchStart);

  listenDocument("keydown", handleKeyDown);

  listen(surface.elements.controlsZoomIn, "click", handleZoomInClick);
  listen(surface.elements.controlsZoomOut, "click", handleZoomOutClick);

  let previousDragStart = surface.elements.container.ondragstart;
  surface.elements.container.ondragstart = () => {
    return false;
  };
  cleanupFunctions.push(() => {
    surface.elements.container.ondragstart = previousDragStart;
  });

  return () => {
    for (let cleanup of cleanupFunctions) {
      cleanup();
    }
    cleanupFunctions = [];
  };
}
