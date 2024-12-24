import { moveSurfaceByEdge } from './edge.js';
import Surface from '../index.js';

export interface MouseParams {
  button: number;
  x: number;
  y: number;
}

export function getMouseParams(event: MouseEvent|TouchEvent, surface: Surface) : MouseParams {
  let bounds = surface.elements.container.getBoundingClientRect();
  return {
    button: (event instanceof TouchEvent ? 0 : event.button),
    x: (event instanceof TouchEvent ? event.touches[0].clientX - bounds.left : event.clientX - bounds.left),
    y: (event instanceof TouchEvent ? event.touches[0].clientY - bounds.top : event.clientY - bounds.top)
  };
}

export interface WheelParams {
  x: number;
  y: number;
}

export function getWheelParams(event: WheelEvent) : WheelParams {
  return {
    x: event.deltaX,
    y: event.deltaY
  };
}

export function mouseMove(event: MouseEvent, surface: Surface) : void {
  if (surface.CONFIG.EDGE_MOVE_ENABLED.VALUE === 1) {
    moveSurfaceByEdge(surface, getMouseParams(event, surface));
  }
}

export function mouseWheel(event: WheelEvent, surface: Surface) : void {
  event.preventDefault();
  surface.scale.stepAndGlide((getWheelParams(event).y < 0 ? 1 : -1), getMouseParams(event, surface));
}

export function mouseDown(event: MouseEvent|TouchEvent, surface: Surface) : void {
  let mouse = getMouseParams(event, surface);
  if (mouse.button === 0) {
    surface.animationStorage.createSurfaceDrag(mouse);
  }
}