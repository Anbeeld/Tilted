import { getSurface } from "./register.js";

export type ContentProps = {
  element: HTMLElement
}

export class Content {
  private _surfaceId: number;
  private get _surface() { return getSurface(this._surfaceId); }

  private _element: HTMLElement;
  public get element() { return this._element; }

  constructor(surfaceId: number, props: ContentProps) {
    this._surfaceId = surfaceId;
    this._element = props.element;

    this._element.style.transformStyle = 'preserve-3d';

    this._surface;
  }
}