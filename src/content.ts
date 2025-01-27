import { getSurface } from "./register.js";

export enum ContentType {
  Scene = 'scene',
  Figure = 'figure'
}

export type ContentProps = {
  type: ContentType
  element: HTMLElement
}

export class Content {
  private _surfaceId: number;
  private get _surface() { return getSurface(this._surfaceId); }

  private _type: ContentType;
  // public get type() { return this._type; }

  private _element: HTMLElement;
  public get element() { return this._element; }

  constructor(surfaceId: number, props: ContentProps) {
    this._surfaceId = surfaceId;
    this._type = props.type;
    this._element = props.element;

    if (this._type === ContentType.Scene) {
      for (let child of this.element.children) {
        child.classList.add(`tilted-figure-${this._surface.id}`);
      }
    } else if (this._type === ContentType.Figure) {
      this._element.classList.add(`tilted-figure-${this._surface.id}`)
    }
  }

  public applyTransformProperty(surfaceRotateX: string) : void {
    let setStyle = (element: HTMLElement) => {
      element.style.transform = 'rotateX(-' + surfaceRotateX + ')';
    }
    if (this._type === ContentType.Scene) {
      for (let child of this.element.children) {
        setStyle(child as HTMLElement);
      }
    } else if (this._type === ContentType.Figure) {
      setStyle(this.element);
    }
  }
}