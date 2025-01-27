import Raoi from "raoi";
import { getSurface } from "./register.js";

export enum ContentType {
  Scene = 'scene',
  Figure = 'figure'
}

export type ContentProps = {
  type: ContentType
  element: HTMLElement
  factor?: number
}

export class Content {
  private _id: number;

  private _surfaceId: number;
  private get _surface() { return getSurface(this._surfaceId); }

  private _type: ContentType;
  private _factor: number;

  private _element: HTMLElement;
  // public get element() { return this._element; }
  private _style: HTMLElement|undefined;

  constructor(surfaceId: number, props: ContentProps) {
    this._id = Raoi.new(this);
    this._surfaceId = surfaceId;
    this._type = props.type;
    this._factor = props.factor || 1;
    this._element = props.element;

    if (this._type === ContentType.Scene) {
      this._element.classList.add(`tilted-scene-${this._surface.id}`);
      this._element.classList.add(`tilted-scene-${this._id}`);
    } else if (this._type === ContentType.Figure) {
      this._element.classList.add(`tilted-figure-${this._surface.id}`)
    }
  }

  private _initStyle() : void {
    if (!this._style) {
      this._style = document.createElement("style");
      this._style.classList.add(`tilted-css-${this._type}-${this._surface.id}-${this._id}`);
      document.head.appendChild(this._style);
    }
  }

  public applyTransformProperty(surfaceRotateX: string) : void {
    if (this._type === ContentType.Scene) {
      this._initStyle();
      if (this._factor !== 1) {
        this._style!.innerHTML = `.tilted-scene-${this._id}>*:not(.tilted-figure-${this._surface.id}){transform: rotateX(calc(-${surfaceRotateX} * ${this._factor}));}`;
      } else {
        this._style!.innerHTML = `.tilted-scene-${this._id}>*:not(.tilted-figure-${this._surface.id}){transform: rotateX(-${surfaceRotateX});}`;
      }
    } else if (this._type === ContentType.Figure) {
      if (this._factor !== 1) {
        this._element.style.transform = `rotateX(calc(-${surfaceRotateX} * ${this._factor}))`;
      } else {
        this._element.style.transform = `rotateX(-${surfaceRotateX})`;
      }
    }
  }
}