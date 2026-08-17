import { roundFloat, Coords } from './utils.js';
import { Config, setupConfig, CustomConfig } from './config.js';
import { initControls } from './controls/controls.js';

import AnimationExecutor from './animation/executor.js';
import { AnimationStorage, Animations } from './animation/storage.js';
import { cssGenerated, cssCore } from './css/css.js';
import Scale from './scale.js';
import Position from './position.js';

import { Content, ContentProps } from './content.js';
import { Registry } from './registry.js';
import { demangleProperty } from './mangle.js';

interface SurfaceElements {
  container: HTMLElement,
  controls: HTMLElement,
  controlsZoomIn: HTMLElement,
  controlsZoomOut: HTMLElement,
  viewport: HTMLElement,
  transform: HTMLElement,
  surface: HTMLElement
}

interface SurfaceStyles {
  core: HTMLElement,
  generated: HTMLElement
}

type Transform = {
  changed: boolean,
  properties: TransformProperties
}
type TransformProperties = TransformProperty[];
type TransformProperty = {
  name: string,
  value: string
}

export default class Surface {
  private _id!: number;
  private set id(value: number) { this._id = value; }
  public get id() : number {return this._id;}

  public readonly CONFIG: Config;

  private _elements!: SurfaceElements;
  private set elements(value: SurfaceElements) { this._elements = value; }
  public get elements() : SurfaceElements {return this._elements;}

  private styles: SurfaceStyles;
  private cleanupControls: () => void = () => {};
  private resizeObservers: ResizeObserver[] = [];
  private destroyed: boolean = false;

  private _position!: Position;
  private set position(value: Position) { this._position = value; }
  public get position() : Position {return this._position;}

  private _scale!: Scale;
  private set scale(value: Scale) { this._scale = value; }
  public get scale() : Scale {return this._scale;}

  private contents: Content[];

  private _animationExecutor!: AnimationExecutor;
  private set animationExecutor(value: AnimationExecutor) { this._animationExecutor = value; }
  public get animationExecutor() : AnimationExecutor {return this._animationExecutor;}

  private _animationStorage!: AnimationStorage;
  private set animationStorage(value: AnimationStorage) { this._animationStorage = value; }
  public get animationStorage() : AnimationStorage {return this._animationStorage;}

  private viewport: Coords = {x: 0, y: 0};

  private _rotate: Coords = {x: 0, y: 0};
  private set rotate(value: Coords) { this._rotate = value; }
  public get rotate() : Coords { return this._rotate; }

  private transform: Transform;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: CustomConfig = {}, contents: ContentProps[]) {
    this.id = Registry.id();
    Registry.add(this);
    this.CONFIG = setupConfig(config);

    this.elements = this.setupElements(elementContainer, elementSurface);
    this.styles = this.setupStyles();

    this.transform = {
      changed: false,
      properties: [
        { name: 'scale', value: '' },
        { name: 'perspective', value: '' },
        { name: 'rotateX', value: '' },
        { name: 'translate3d', value: '0, 0, 0' }
      ]
    };

    this.animationStorage = new AnimationStorage(this.id);
    this.animationExecutor = new AnimationExecutor(this.id);

    this.cleanupControls = initControls(this);

    this.updateViewport();

    this.contents = [];

    this.position = new Position(this.id);

    this.updatePerspective();

    this.scale = new Scale(this.id);

    for (let contentProps of contents) {
      this.addContent(contentProps);
    }

    let containerResizeObserver = new ResizeObserver(() => {
      if (this.destroyed) return;
      this.updateCssGenerated();
      this.updateViewport();
      this.position.enforceLimits();
    });
    containerResizeObserver.observe(this.elements.container);
    this.resizeObservers.push(containerResizeObserver);

    let surfaceResizeObserver = new ResizeObserver(() => {
      if (this.destroyed) return;
      this.updateCssGenerated();
      this.updateViewport();
      this.position.enforceLimits();
    });
    surfaceResizeObserver.observe(this.elements.surface);
    this.resizeObservers.push(surfaceResizeObserver);
  }

  private assertNotDestroyed() : void {
    if (this.destroyed) {
      throw new Error('This Tilted surface has been destroyed');
    }
  }

  public get selectors() {
    let base = `tilted-`;
    return {
      container: `${base}container`,
      viewport: `${base}viewport`,
      transform: `${base}transform`,
      preserve3d: `${base}preserve-3d`,
      surface: `${base}surface`,
      controls: `${base}controls`,
      controlsZoomIn: `${base}controls-zoom-in`,
      controlsZoomOut: `${base}controls-zoom-out`,
      cssCore: `${base}css-core`,
      cssGenerated: `${base}css-generated`,
      surfaceId: `[data-surface-id="${this.id}"]`,
      scene: `${base}scene`,
      figure: `${base}figure`,
      cssScene: `${base}css-scene`,
      cssFigure: `${base}css-figure`,
    }
  }

  public addIdToDataset(element: HTMLElement) {
    demangleProperty(element.dataset, 'surfaceId', this.id.toString());
  }

  private setupElements(elementContainer: HTMLElement, elementSurface: HTMLElement) : SurfaceElements {
    elementContainer.classList.add(this.selectors.container);
    this.addIdToDataset(elementContainer);

    let elementViewport = document.createElement('div');
    elementViewport.classList.add(this.selectors.viewport);
    this.addIdToDataset(elementViewport);

    let elementTransform = document.createElement('div');
    elementTransform.classList.add(this.selectors.transform);
    elementTransform.classList.add(this.selectors.preserve3d);
    this.addIdToDataset(elementTransform);

    elementSurface.classList.add(this.selectors.surface);
    this.addIdToDataset(elementSurface);

    let elementControls = document.createElement('div');
    elementControls.classList.add(this.selectors.controls);
    this.addIdToDataset(elementControls);

    let elementControlsZoomIn = document.createElement('div');
    elementControlsZoomIn.classList.add(this.selectors.controlsZoomIn);
    this.addIdToDataset(elementControlsZoomIn);
    elementControls.appendChild(elementControlsZoomIn);

    let elementControlsZoomOut = document.createElement('div');
    elementControlsZoomOut.classList.add(this.selectors.controlsZoomOut);
    this.addIdToDataset(elementControlsZoomOut);
    elementControls.appendChild(elementControlsZoomOut);

    let children: Element[] = [];
    for (let child of elementContainer.children) {
      children.push(child);
    }
    for (let child of children) {
      elementTransform.appendChild(child);
    }
    if (elementSurface.parentElement !== elementTransform) {
      elementTransform.appendChild(elementSurface);
    }
    elementViewport.appendChild(elementTransform);
    elementContainer.appendChild(elementViewport);
    elementContainer.appendChild(elementControls);

    return {
      container: elementContainer,
      controls: elementControls,
      controlsZoomIn: elementControlsZoomIn,
      controlsZoomOut: elementControlsZoomOut,
      viewport: elementViewport,
      transform: elementTransform,
      surface: elementSurface
    };
  }

  private setupStyles() : SurfaceStyles {
    let elementStyleCore = document.createElement('style');
    elementStyleCore.classList.add(this.selectors.cssCore);
    this.addIdToDataset(elementStyleCore);
    elementStyleCore.innerHTML = cssCore(this);
    document.head.appendChild(elementStyleCore);

    let elementStyleGenerated = document.createElement('style');
    elementStyleGenerated.classList.add(this.selectors.cssGenerated);
    this.addIdToDataset(elementStyleGenerated);
    elementStyleGenerated.innerHTML = cssGenerated(this);
    document.head.appendChild(elementStyleGenerated);

    return {
      core: elementStyleCore,
      generated: elementStyleGenerated
    };
  }

  private updateCssGenerated() : void {
    this.styles.generated.innerHTML = cssGenerated(this);
  }

  public get containerWidth() : number {
    return this.elements.container.offsetWidth;
  }
  public get containerHeight() : number {
    return this.elements.container.offsetHeight;
  }
  public get surfaceWidth() : number {
    return this.elements.surface.offsetWidth;
  }
  public get surfaceHeight() : number {
    return this.elements.surface.offsetHeight;
  }
  
  public setTransformValues(properties: TransformProperties, immediately: boolean = false) : void {
    for (let property of properties) {
      for (let transformProperty of this.transform.properties) {
        if (transformProperty.name === property.name) {
          transformProperty.value = property.value;
        }
      }
    }
    if (immediately) {
      this.applyTransformProperty(true);
    } else {
      this.transform.changed = true;
      this.animationExecutor.initiate();
    }
  }

  public applyTransformProperty(forced: boolean = false) : void {
    if (!this.transform.changed && !forced) {
      return;
    }
    this.transform.changed = false;

    let style = '';
    for (let transformProperty of this.transform.properties) {
      style += `${transformProperty.name}(${transformProperty.value}) `;
      if (transformProperty.name === 'rotateX') {
        for (let content of this.contents) {
          content.applyTransformProperty(transformProperty.value);
        }
      }
    }

    this.elements.transform.style.transform = style;
  }

  private updateViewport() : void {
    this.viewport = {
      x: 0 - this.surfaceWidth / 2 + this.containerWidth / 2,
      y: 0 - this.surfaceHeight / 2 + this.containerHeight / 2
    }

    this.elements.viewport.style.top = this.viewport.y + 'px';
    this.elements.viewport.style.left = this.viewport.x + 'px';
  }

  private updatePerspective() : void {
    this.setTransformValues([{
      name: 'perspective',
      value: (Math.round(this.CONFIG.PERSPECTIVE_VALUE.VALUE * this.CONFIG.PERSPECTIVE_FACTOR.VALUE)).toString() + 'px'
    }]);
  }

  public updateRotate(scale: number|null = null) : void {
    if (scale === null) {
      scale = this.scale.value;
    }
    const range = this.CONFIG.SCALE_MAX.VALUE - this.CONFIG.SCALE_MIN.VALUE;
    let percentOfMaxScale = range === 0 ? 0 : (scale - this.CONFIG.SCALE_MIN.VALUE) / range;
    this.rotate = {
      x: roundFloat(this.CONFIG.TILT_MIN.VALUE + percentOfMaxScale * (this.CONFIG.TILT_MAX.VALUE - this.CONFIG.TILT_MIN.VALUE), this.CONFIG.TILT_ROUNDING.VALUE),
      y: 0
    }
  }

  public cancelOngoingMoves() : void {
    this.animationStorage.destroy(Animations.SurfaceGlide);
  }

  public addContent(properties: ContentProps) : Content {
    this.assertNotDestroyed();
    let content = new Content(this.id, properties);
    this.contents.push(content);
    for (let transformProperty of this.transform.properties) {
      if (transformProperty.name === 'rotateX') {
        content.applyTransformProperty(transformProperty.value);
      }
    }
    return content;
  }

  public deleteContent(element: HTMLElement) : void {
    this.assertNotDestroyed();
    const index = this.contents.findIndex(c => c.element === element);
    if (index !== -1) {
      this.contents[index]!.clearSideEffects(this.contents);
      this.contents.splice(index, 1);
    }
  }

  public clearContents() : void {
    this.assertNotDestroyed();
    for (let content of this.contents) {
      content.clearSideEffects();
    }
    this.contents = [];
  }

  public destroy() : void {
    if (this.destroyed) {
      return;
    }
    this.destroyed = true;

    this.cleanupControls();
    this.cleanupControls = () => {};

    for (let observer of this.resizeObservers) {
      observer.disconnect();
    }
    this.resizeObservers = [];

    this.animationStorage.destroy(Animations.SurfaceDrag);
    this.animationStorage.destroy(Animations.SurfaceEdge);
    this.animationStorage.destroy(Animations.SurfaceGlide);
    this.animationStorage.destroy(Animations.SurfaceZoom);

    for (let content of this.contents) {
      content.clearSideEffects();
    }
    this.contents = [];

    this.styles.core.remove();
    this.styles.generated.remove();

    this.elements.container.classList.remove(this.selectors.container);
    this.elements.container.removeAttribute('data-surface-id');
    this.elements.surface.classList.remove(this.selectors.surface);
    this.elements.surface.removeAttribute('data-surface-id');
    this.elements.transform.classList.remove(this.selectors.transform);
    this.elements.transform.classList.remove(this.selectors.preserve3d);
    this.elements.transform.removeAttribute('data-surface-id');
    this.elements.transform.style.transform = '';
    this.elements.viewport.classList.remove(this.selectors.viewport);
    this.elements.viewport.removeAttribute('data-surface-id');
    this.elements.viewport.style.top = '';
    this.elements.viewport.style.left = '';
    this.elements.controls.classList.remove(this.selectors.controls);
    this.elements.controls.removeAttribute('data-surface-id');
    this.elements.controlsZoomIn.classList.remove(this.selectors.controlsZoomIn);
    this.elements.controlsZoomIn.removeAttribute('data-surface-id');
    this.elements.controlsZoomOut.classList.remove(this.selectors.controlsZoomOut);
    this.elements.controlsZoomOut.removeAttribute('data-surface-id');

    let transformChildren: HTMLElement[] = [];
    for (let child of this.elements.transform.children) {
      if (child instanceof HTMLElement) {
        transformChildren.push(child);
      }
    }
    for (let child of transformChildren) {
      this.elements.container.appendChild(child);
    }
    this.elements.viewport.remove();
    this.elements.controls.remove();

    Registry.remove(this.id);
  }
}
