import { demangleProperty, mangleProperty } from "./mangle.js";
import { Registry } from "./registry.js";
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
  private get surface() { return Registry.surfaceRequired(this.surfaceId); }

  private type: ContentType;
  private factor: number;

  // @ts-ignore Doesn't understand setters and getters
  private _element: HTMLElement;
  private set element(value: HTMLElement) { this._element = value; }
  public get element() { return this._element; }

  private style: HTMLElement|undefined;

  constructor(surfaceId: number, props: ContentProps) {
    this.id = Registry.id();
    this.surfaceId = surfaceId;
    this.type = mangleProperty(props, 'type');
    this.factor = mangleProperty(props, 'factor') ?? 1;
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
      parentElement.classList.add(this.surface.selectors.preserve3d);
      parentElement = parentElement.parentElement;
    }
  }

  public addIdToDataset(element: HTMLElement) {
    demangleProperty(element.dataset, 'contentId', this.id.toString());
  }

  private initStyle() : void {
    if (!this.style) {
      this.style = document.createElement("style");
      this.style.classList.add(this.type === ContentType.Scene ? this.surface.selectors.cssScene : this.surface.selectors.cssFigure);
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

  public usesParent(el: HTMLElement) : boolean {
    let p: HTMLElement | null = this.type === ContentType.Scene ? this.element : this.element.parentElement;
    while (p && p !== this.surface.elements.transform) {
      if (p === el) return true;
      p = p.parentElement;
    }
    return false;
  }

  public clearSideEffects(survivingContents: Content[] = []) : void {
    if (this.style) {
      this.style.remove();
    }

    if (this.type === ContentType.Scene) {
      this.element.classList.remove(this.surface.selectors.scene);
    } else if (this.type === ContentType.Figure) {
      this.element.classList.remove(this.surface.selectors.figure);
    }
    this.element.removeAttribute('data-surface-id');
    this.element.removeAttribute('data-content-id');

    let parentElement: HTMLElement | null;
    if (this.type === ContentType.Scene) {
      parentElement = this.element;
    } else {
      parentElement = this.element.parentElement;
    }
    while (parentElement !== this.surface.elements.transform) {
      if (!parentElement) {
        throw new Error(`Couldn't reach Tilted id ${this.surface.id} transform element from content id ${this.id}`);
      }
      const stillNeeded = survivingContents.some(c => c !== this && c.usesParent(parentElement!));
      if (!stillNeeded) {
        parentElement.classList.remove(this.surface.selectors.preserve3d);
      }
      parentElement = parentElement.parentElement;
    }
  }
}