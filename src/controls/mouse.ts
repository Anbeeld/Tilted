import { moveSurfaceByEdge } from './edge.js';
import Surface from '../surface.js';
import { Animations } from '../animation/storage.js';

export interface MouseParams {
  button: number;
  x: number;
  y: number;
}

export function getMouseParams(event: MouseEvent|TouchEvent, surface: Surface) : MouseParams {
  let bounds = surface.elements.container.getBoundingClientRect();
  let isTouchEvent = window.TouchEvent && event instanceof TouchEvent;
  return {
    button: (isTouchEvent ? 0 : (event as MouseEvent).button),
    x: (isTouchEvent ? (event as TouchEvent).touches[0]!.clientX - bounds.left : (event as MouseEvent).clientX - bounds.left),
    y: (isTouchEvent ? (event as TouchEvent).touches[0]!.clientY - bounds.top : (event as MouseEvent).clientY - bounds.top)
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
    surface.animationStorage.create(Animations.SurfaceDrag, [mouse]);
  }
}