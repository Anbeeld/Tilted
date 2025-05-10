import { roundFloat, Coords } from './utils.js';
import { ConfigProperties, setupConfig } from './config.js';
import { initControls } from './controls/controls.js';

import AnimationExecutor from './animation/executor.js';
import { AnimationStorage, Animations } from './animation/storage.js';
import { cssGenerated, cssCore } from './css/css.js';
import Scale from './scale.js';
import Position from './position.js';

import { Content, ContentProps } from './content.js';
import { Register } from './register.js';

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
  // @ts-ignore Doesn't understand setters and getters
  private _id: number;
  private set id(value: number) { this._id = value; }
  public get id() : number {return this._id;}

  public readonly CONFIG: ConfigProperties;

  // @ts-ignore Doesn't understand setters and getters
  private _elements: SurfaceElements;
  private set elements(value: SurfaceElements) { this._elements = value; }
  public get elements() : SurfaceElements {return this._elements;}

  private styles: SurfaceStyles;

  // @ts-ignore Doesn't understand setters and getters
  private _position: Position;
  private set position(value: Position) { this._position = value; }
  public get position() : Position {return this._position;}

  // @ts-ignore Doesn't understand setters and getters
  private _scale: Scale;
  private set scale(value: Scale) { this._scale = value; }
  public get scale() : Scale {return this._scale;}

  private contents: Content[];

  // @ts-ignore Doesn't understand setters and getters
  private _animationExecutor: AnimationExecutor;
  private set animationExecutor(value: AnimationExecutor) { this._animationExecutor = value; }
  public get animationExecutor() : AnimationExecutor {return this._animationExecutor;}

  // @ts-ignore Doesn't understand setters and getters
  private _animationStorage: AnimationStorage;
  private set animationStorage(value: AnimationStorage) { this._animationStorage = value; }
  public get animationStorage() : AnimationStorage {return this._animationStorage;}

  private viewport: Coords = {x: 0, y: 0};

  // @ts-ignore Doesn't understand setters and getters
  private _rotate: Coords = {x: 0, y: 0};
  private set rotate(value: Coords) { this._rotate = value; }
  public get rotate() : Coords { return this._rotate; }

  private transform: Transform;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: {}, contents: ContentProps[]) {
    this.id = Register.id();
    Register.add(this);
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

    initControls(this);

    this.updateViewport();
    new ResizeObserver(() => {this.updateCssGenerated();this.updateViewport();this.position.enforceLimits();}).observe(this.elements.container);
    new ResizeObserver(() => {this.updateCssGenerated();this.position.enforceLimits();}).observe(this.elements.surface);

    this.contents = [];
    for (let contentProps of contents) {
      this.contents.push(new Content(this.id, contentProps));
    }

    this.position = new Position(this.id);

    this.updatePerspective();

    this.scale = new Scale(this.id);
  }

  private setupElements(elementContainer: HTMLElement, elementSurface: HTMLElement) : SurfaceElements {
    elementContainer.classList.add(`tilted-${this.id}-container`);

    let elementViewport = document.createElement('div');
    elementViewport.classList.add(`tilted-${this.id}-viewport`);

    let elementTransform = document.createElement('div');
    elementTransform.classList.add(`tilted-${this.id}-transform`);
    elementTransform.classList.add(`tilted-${this.id}-preserve-3d`);

    elementSurface.classList.add(`tilted-${this.id}-surface`);

    let elementControls = document.createElement('div');
    elementControls.classList.add(`tilted-${this.id}-controls`);
    let elementControlsZoomIn = document.createElement('div');
    elementControlsZoomIn.classList.add(`tilted-${this.id}-controls-zoom-in`);
    let elementControlsZoomOut = document.createElement('div');
    elementControlsZoomOut.classList.add(`tilted-${this.id}-controls-zoom-out`);
    elementControls.appendChild(elementControlsZoomIn);
    elementControls.appendChild(elementControlsZoomOut);

    let children = new Array();
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
    elementStyleCore.classList.add(`tilted-${this.id}-css-core`);
    elementStyleCore.innerHTML = cssCore(this);
    document.head.appendChild(elementStyleCore);

    let elementStyleGenerated = document.createElement('style');
    elementStyleGenerated.classList.add(`tilted-${this.id}-css-generated`);
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
    let percentOfMaxScale = (scale - this.CONFIG.SCALE_MIN.VALUE) / (this.CONFIG.SCALE_MAX.VALUE - this.CONFIG.SCALE_MIN.VALUE);
    this.rotate = {
      x: roundFloat(this.CONFIG.TILT_MIN.VALUE + percentOfMaxScale * (this.CONFIG.TILT_MAX.VALUE - this.CONFIG.TILT_MIN.VALUE), this.CONFIG.TILT_ROUNDING.VALUE),
      y: 0
    }
  }

  public log(changes: {desc: string, from?: number, to?: number}[]|false = false) : void {
    let changesString = '';
    if (changes) {
      for (let change of changes) {
        changesString += change.desc + (change.from !== undefined ? ' from ' + change.from : '') + (change.to !== undefined ? ' to ' + change.to : '') + '\n';
      }
    }

    console.log(
      changesString +
      `x: ${this.position.coords.x}\n` +
      `y: ${this.position.coords.y}\n` +
      `limit.x: ${this.position.limit.x}\n` +
      `limit.y: ${this.position.limit.y}\n` +
      `scale: ${this.scale.value}`
    );
  }

  public cancelOngoingMoves() : void {
    this.animationStorage.destroy(Animations.SurfaceGlide);
  }
}