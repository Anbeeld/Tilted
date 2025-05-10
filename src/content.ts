import { Register } from "./register.js";
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
  private id: number;

  private surfaceId: number;
  private get surface() { return Register.surface(this.surfaceId)!; }

  private type: ContentType;
  private factor: number;

  private element: HTMLElement;
  // public get element() { return this.element; }
  private style: HTMLElement|undefined;

  constructor(surfaceId: number, props: ContentProps) {
    this.id = Register.id();
    this.surfaceId = surfaceId;
    this.type = props.type;
    this.factor = props.factor || 1;
    this.element = props.element;

    if (!this.surface.elements.transform.contains(this.element)) {
      throw new Error(`Tilted id ${this.surface.id} transform element doesn't contain content id ${this.id} element`);
    }

    if (this.type === ContentType.Scene) {
      this.element.classList.add(`tilted-${this.surfaceId}-scene`);
      this.element.classList.add(`tilted-${this.surfaceId}-scene-${this.id}`);
    } else if (this.type === ContentType.Figure) {
      this.element.classList.add(`tilted-${this.surfaceId}-figure`);
      this.element.classList.add(`tilted-${this.surfaceId}-figure-${this.id}`);
    }

    // Add parent element into 3D rendering context until transform is reached, forming a single context all the way
    let parentElement;
    if (this.type === ContentType.Scene) {
      parentElement = this.element;
    } else if (this.type === ContentType.Figure) {
      parentElement = this.element.parentElement;
    }
    while (parentElement !== this.surface.elements.transform) {
      if (!parentElement) {
        throw new Error(`Couldn't reach Tilted id ${this.surface.id} transform element from content id ${this.id}`);
      }
      parentElement.classList.add(`tilted-${this.surfaceId}-preserve-3d`);
      parentElement = parentElement.parentElement;
    }
  }

  private initStyle() : void {
    if (!this.style) {
      this.style = document.createElement("style");
      this.style.classList.add(`tilted-${this.surface.id}-css-${this.type}-${this.id}`);
      document.head.appendChild(this.style);
    }
  }

  public applyTransformProperty(surfaceRotateX: string) : void {
    let transformValue = `rotateX(-${this.factor === 1 ? surfaceRotateX : multiplyCssDegrees(surfaceRotateX, this.factor, this.surface.CONFIG.TILT_ROUNDING.VALUE)})`;
    if (this.type === ContentType.Scene) {
      this.initStyle();
      let newInnerHTML = 
      `.tilted-${this.surfaceId}-scene-${this.id}>*:not(.tilted-${this.surfaceId}-figure){` +
        `transform:${transformValue}` +
      `}`;
      if (this.style!.innerHTML !== newInnerHTML) {
        this.style!.innerHTML = newInnerHTML;
      }
    } else if (this.type === ContentType.Figure) {
      this.element.style.transform = transformValue;
    }
  }
}