import { demangleProperty, mangleProperty } from "./mangle.js";
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
    this.type = mangleProperty(props, 'type');
    this.factor = mangleProperty(props, 'factor') || 1;
    this.element = mangleProperty(props, 'element');

    if (!this.surface.elements.transform.contains(this.element)) {
      throw new Error(`Tilted id ${this.surface.id} transform element doesn't contain content id ${this.id} element`);
    }

    if (this.type === ContentType.Scene) {
      this.element.classList.add(this.surface.selectors.scene);
    } else if (this.type === ContentType.Figure) {
      this.element.classList.add(this.surface.selectors.figure);
    }
    this.surface.addIdToDataset(this.element);
    this.addIdToDataset(this.element);

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
      parentElement.classList.add(this.surface.selectors.preverve3d);
      parentElement = parentElement.parentElement;
    }
  }

  public addIdToDataset(element: HTMLElement) {
    demangleProperty(element.dataset, 'contentId', this.id.toString());
  }

  private initStyle() : void {
    if (!this.style) {
      this.style = document.createElement("style");
      this.style.classList.add(this.type == ContentType.Scene ? this.surface.selectors.cssScene : this.surface.selectors.cssFigure);
      this.surface.addIdToDataset(this.style);
      this.addIdToDataset(this.style);
      document.head.appendChild(this.style);
    }
  }

  public applyTransformProperty(surfaceRotateX: string) : void {
    let transformValue = `rotateX(-${this.factor === 1 ? surfaceRotateX : multiplyCssDegrees(surfaceRotateX, this.factor, this.surface.CONFIG.TILT_ROUNDING.VALUE)})`;
    if (this.type === ContentType.Scene) {
      this.initStyle();
      let newInnerHTML = 
      `.${this.surface.selectors.scene}${this.surface.selectors.surfaceId}[data-content-id="${this.id}"]>*:not(.${this.surface.selectors.figure}${this.surface.selectors.surfaceId}){` +
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