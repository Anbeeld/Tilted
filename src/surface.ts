import { roundFloat, Coords } from './utils.js';
import { ConfigProperties, setupConfig } from './config.js';
import { initControls } from './controls/controls.js';

import AnimationExecutor from './animation/executor.js';
import { AnimationStorage, Animations } from './animation/storage.js';
import { generateCssDynamic, generateCssStatic } from './css/css.js';
import Scale from './scale.js';
import Position from './position.js';

import { Entity, EntityProps } from './entity.js';
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
  static: HTMLElement,
  dynamic: HTMLElement
}

type TransformValues = {
  scale: string,
  perspective: string,
  rotateX: string,
  translate3d: string
}
type TransformProperty = {
  changed: boolean,
  values: TransformValues
}

export default class Surface {
  private _id: number;
  public get id() : number {return this._id;}

  public readonly CONFIG: ConfigProperties;

  private _elements: SurfaceElements;
  public get elements() : SurfaceElements {return this._elements;}

  private _styles: SurfaceStyles;

  private _position: Position;
  public get position() : Position {return this._position;}

  private _scale: Scale;
  public get scale() : Scale {return this._scale;}

  private _entities: Entity[];

  private _animationExecutor: AnimationExecutor;
  public get animationExecutor() : AnimationExecutor {return this._animationExecutor;}
  private _animationStorage: AnimationStorage;
  public get animationStorage() : AnimationStorage {return this._animationStorage;}

  private _viewport = {x: 0, y: 0};

  private _rotate = {x: 0, y: 0};
  public get rotate() : Coords {
    return {x: this._rotate.x, y: this._rotate.y};
  }

  private _transformProperty: TransformProperty;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: {} = {}, entity: EntityProps[] = []) {
    this._id = Register.id();
    Register.add(this);
    this.CONFIG = setupConfig(config);

    this._elements = this._setupElements(elementContainer, elementSurface);
    this._styles = this._setupStyles();

    this._transformProperty = {
      changed: false,
      values: {
        scale: '',
        perspective: '',
        rotateX: '',
        translate3d: '0, 0, 0'
      }
    };

    this._animationStorage = new AnimationStorage(this.id);
    this._animationExecutor = new AnimationExecutor(this.id);

    initControls(this);

    this._updateViewport();
    new ResizeObserver(() => {this._updateCssDynamic();this._updateViewport();this._position.enforceLimits();}).observe(this.elements.container);
    new ResizeObserver(() => {this._updateCssDynamic();this._position.enforceLimits();}).observe(this.elements.surface);

    this._entities = [];
    for (let entityProps of entity) {
      this._entities.push(new Entity(this.id, entityProps));
    }

    this._position = new Position(this.id);

    this._updatePerspective();

    this._scale = new Scale(this.id);
  }

  private _setupElements(elementContainer: HTMLElement, elementSurface: HTMLElement) : SurfaceElements {
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

  private _setupStyles() : SurfaceStyles {
    let elementStyleStatic = document.createElement('style');
    elementStyleStatic.classList.add(`tilted-${this.id}-css-static`);
    elementStyleStatic.innerHTML = generateCssStatic(this);
    document.head.appendChild(elementStyleStatic);

    let elementStyleDynamic = document.createElement('style');
    elementStyleDynamic.classList.add(`tilted-${this.id}-css-dynamic`);
    elementStyleDynamic.innerHTML = generateCssDynamic(this);
    document.head.appendChild(elementStyleDynamic);

    return {
      static: elementStyleStatic,
      dynamic: elementStyleDynamic
    };
  }

  private _updateCssDynamic() : void {
    this._styles.dynamic.innerHTML = generateCssDynamic(this);
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
  
  public setTransformValues(values: {name: string, value: string}[], immediately: boolean = false) : void {
    for (let {name, value} of values) {
      if (this._transformProperty.values.hasOwnProperty(name as keyof TransformValues)) {
        this._transformProperty.values[name as keyof TransformValues] = value;
      }
    }
    if (immediately) {
      this.applyTransformProperty(true);
    } else {
      this._transformProperty.changed = true;
      this._animationExecutor.initiate();
    }
  }

  public applyTransformProperty(forced: boolean = false) : void {
    if (!this._transformProperty.changed && !forced) {
      return;
    }
    this._transformProperty.changed = false;
    
    this._elements.transform.style.transform = 
    `scale(${this._transformProperty.values.scale}) ` +
    `perspective(${this._transformProperty.values.perspective}) ` +
    `rotateX(${this._transformProperty.values.rotateX}) ` +
    `translate3d(${this._transformProperty.values.translate3d})`;

    for (let entity of this._entities) {
      entity.applyTransformProperty(this._transformProperty.values.rotateX);
    }
  }

  private _updateViewport() : void {
    this._viewport = {
      x: 0 - this.surfaceWidth / 2 + this.containerWidth / 2,
      y: 0 - this.surfaceHeight / 2 + this.containerHeight / 2
    }

    this.elements.viewport.style.top = this._viewport.y + 'px';
    this.elements.viewport.style.left = this._viewport.x + 'px';
  }

  private _updatePerspective() : void {
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
    this._rotate = {
      x: roundFloat(this.CONFIG.TILT_MIN.VALUE + percentOfMaxScale * (this.CONFIG.TILT_MAX.VALUE - this.CONFIG.TILT_MIN.VALUE), this.CONFIG.TILT_ROUNDING.VALUE),
      y: 0
    }
  }

  public log(changes: {desc: string, from?: number, to?: number}[]|false = false) : void {
    if (this.CONFIG.DEBUG_MODE.VALUE === 0) {
      return;
    }

    let changesString = '';
    if (changes) {
      for (let change of changes) {
        changesString += change.desc + (change.from !== undefined ? ' from ' + change.from : '') + (change.to !== undefined ? ' to ' + change.to : '') + '\n';
      }
    }

    console.log(
      changesString +
      `x: ${this._position.coords.x}\n` +
      `y: ${this._position.coords.y}\n` +
      `limit.x: ${this._position.limit.x}\n` +
      `limit.y: ${this._position.limit.y}\n` +
      `scale: ${this.scale.value}`
    );
  }

  public cancelOngoingMoves() : void {
    this._animationStorage.destroy(Animations.SurfaceGlide);
  }
}