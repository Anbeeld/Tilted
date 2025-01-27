import Raoi from "raoi";
import { getSurface } from "./register.js";
import { multiplyCssDegrees } from "./utils.js";

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
      this._element.classList.add(`tilted-${this._surfaceId}-scene`);
      this._element.classList.add(`tilted-${this._surfaceId}-scene-${this._id}`);
    } else if (this._type === ContentType.Figure) {
      this._element.classList.add(`tilted-${this._surfaceId}-figure`);
      this._element.classList.add(`tilted-${this._surfaceId}-figure-${this._id}`);
    }
  }

  private _initStyle() : void {
    if (!this._style) {
      this._style = document.createElement("style");
      this._style.classList.add(`tilted-${this._surface.id}-css-${this._type}-${this._id}`);
      document.head.appendChild(this._style);
    }
  }

  public applyTransformProperty(surfaceRotateX: string) : void {
    if (this._type === ContentType.Scene) {
      this._initStyle();
      this._style!.innerHTML = 
      `.tilted-${this._surfaceId}-scene-${this._id}>*:not(.tilted-${this._surfaceId}-figure){` +
        `transform: rotateX(-${this._factor === 1 ? surfaceRotateX : multiplyCssDegrees(surfaceRotateX, this._factor, this._surface.CONFIG.ROTATE_ROUNDING.VALUE)});` +
      `}`;
    } else if (this._type === ContentType.Figure) {
      this._element.style.transform = `rotateX(-${this._factor === 1 ? surfaceRotateX : multiplyCssDegrees(surfaceRotateX, this._factor, this._surface.CONFIG.ROTATE_ROUNDING.VALUE)})`;
    }
  }
}