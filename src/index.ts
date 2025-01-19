import { roundFloat, clamp, EasingFunctions } from './utils.js';
import { ConfigProperties, setupConfig } from './config.js';
import { initControls } from './controls/controls.js';
import Raoi from 'raoi';

import AnimationExecutor from './animation/executor.js';
import AnimationStorage from './animation/storage.js';
import { generateCssDynamic, generateCssStatic } from './css/css.js';
import Scale from './scale.js';

interface SurfaceElements {
  container: HTMLElement,
  controls: HTMLElement,
  controlsZoomIn: HTMLElement,
  controlsZoomOut: HTMLElement,
  viewport: HTMLElement,
  scale: HTMLElement,
  position: HTMLElement,
  surface: HTMLElement
}

interface SurfaceStyles {
  static: HTMLElement,
  dynamic: HTMLElement
}

export default class Surface {
  private _id: number;
  public get id() : number {return this._id;}

  public readonly CONFIG: ConfigProperties;
  // public readonly get CONFIG() : ConfigProperties {return this.CONFIG;}

  private _elements: SurfaceElements;
  public get elements() : SurfaceElements {return this._elements;}

  private _styles: SurfaceStyles;

  private _scale: Scale;
  public get scale() : Scale {return this._scale;}

  private _animationExecutor: AnimationExecutor;
  public get animationExecutor() : AnimationExecutor {return this._animationExecutor;}
  private _animationStorage: AnimationStorage;
  public get animationStorage() : AnimationStorage {return this._animationStorage;}

  private _viewport = {x: 0, y: 0};
  private _coords = {x: 0, y: 0};
  public get coords() : {x: number, y: number} {
    return {x: this._coords.x, y: this._coords.y};
  }

  private _skew = {x: 0, y: 0};
  public get skew() : {x: number, y: number} {
    return {x: this._skew.x, y: this._skew.y};
  }

  public constructor(elementContainer: HTMLElement, elementMap: HTMLElement, config: {} = {}) {
    this._id = Raoi.new(this);
    this.CONFIG = setupConfig(config);

    this._elements = this._setupElements(elementContainer, elementMap);
    this._styles = this._setupStyles();

    this._animationStorage = new AnimationStorage(this);
    this._animationExecutor = new AnimationExecutor(this._animationStorage);

    initControls(this);

    this._updateViewport();
    new ResizeObserver(() => {this._updateCssDynamic();this._updateViewport();this._enforceLimits();}).observe(this.elements.container);
    new ResizeObserver(() => {this._updateCssDynamic();this._enforceLimits();}).observe(this.elements.surface);

    this._scale = new Scale(this, this.CONFIG.SCALE_DEFAULT.VALUE);
  }

  private _setupElements(elementContainer: HTMLElement, elementMap: HTMLElement) : SurfaceElements {
    elementContainer.classList.add('tilted-container-' + this.id);

    let elementViewport = document.createElement('div');
    elementViewport.classList.add('tilted-viewport-' + this.id);

    let elementScale = document.createElement('div');
    elementScale.classList.add('tilted-scale-' + this.id);

    let elementPosition = document.createElement('div');
    elementPosition.classList.add('tilted-position-' + this.id);

    elementMap.classList.add('tilted-surface-' + this.id);

    let elementControls = document.createElement('div');
    elementControls.classList.add('tilted-controls-' + this.id);
    let elementControlsZoomIn = document.createElement('div');
    elementControlsZoomIn.classList.add('tilted-controls-zoom-in-' + this.id);
    let elementControlsZoomOut = document.createElement('div');
    elementControlsZoomOut.classList.add('tilted-controls-zoom-out-' + this.id);
    elementControls.appendChild(elementControlsZoomIn);
    elementControls.appendChild(elementControlsZoomOut);

    elementPosition.appendChild(elementMap);
    elementScale.appendChild(elementPosition);
    elementViewport.appendChild(elementScale);
    elementContainer.appendChild(elementViewport);
    elementContainer.appendChild(elementControls);

    return {
      container: elementContainer,
      controls: elementControls,
      controlsZoomIn: elementControlsZoomIn,
      controlsZoomOut: elementControlsZoomOut,
      viewport: elementViewport,
      scale: elementScale,
      position: elementPosition,
      surface: elementMap
    };
  }

  private _setupStyles() : SurfaceStyles {
    let elementStyleStatic = document.createElement('style');
    elementStyleStatic.classList.add('tilted-css-static-' + this.id);
    elementStyleStatic.innerHTML = generateCssStatic(this);
    document.head.appendChild(elementStyleStatic);

    let elementStyleDynamic = document.createElement('style');
    elementStyleDynamic.classList.add('tilted-css-dynamic-' + this.id);
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

  private get _limit() : {x: number, y: number} {
    return {
      x: Math.round(this.surfaceWidth / 2 - this.containerWidth * 0.25),
      y: Math.round(this.surfaceHeight / 2 - this.containerHeight * 0.25)
    };
  }
  public get min() : {x: number, y: number} {
    return {
      x: this._limit.x * -1,
      y: this._limit.y * -1
    };
  }
  public get max() : {x: number, y: number} {
    return {
      x: this._limit.x,
      y: this._limit.y
    };
  }

  public move(vector: {x: number, y: number}, interimRounding: number = this.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (interimRounding >= 0) {
      vector.x = roundFloat(vector.x, interimRounding);
      vector.y = roundFloat(vector.y, interimRounding);
    }

    if (vector.x === 0 && vector.y === 0) {
      return false;
    }

    let coords = {
      x: clamp(roundFloat(this._coords.x + vector.x, finalRounding), this.min.x, this.max.x),
      y: clamp(roundFloat(this._coords.y + vector.y, finalRounding), this.min.y, this.max.y)
    };

    if (coords.x === this._coords.x && coords.y === this._coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'move coords.x', from: this._coords.x, to: coords.x},
      {desc: 'move coords.y', from: this._coords.y, to: coords.y}
    ]);

    this._coords = coords;

    this.elements.position.style.transform = 'translate3d(' + (this._coords.x * -1) + 'px, ' + (this._coords.y * -1) + 'px, 0)';

    return true;
  }

  public moveTo(coords: {x: number, y: number}, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    coords.x = roundFloat(coords.x, finalRounding);
    coords.y = roundFloat(coords.y, finalRounding);

    if (this._coords.x === coords.x && this._coords.y === coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'moveTo coords.x', from: this._coords.x, to: coords.x},
      {desc: 'moveTo coords.y', from: this._coords.y, to: coords.y}
    ]);

    return this.move({x: coords.x - this._coords.x, y: coords.y - this._coords.y}, -1, finalRounding);
  }

  public glide(vector: {x: number, y: number}, time: number = this.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseInOutSine, interimRounding: number = this.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      vector.x = roundFloat(this._coords.x + vector.x, finalRounding) - this._coords.x;
      vector.y = roundFloat(this._coords.y + vector.y, finalRounding) - this._coords.y;
    }

    if (interimRounding >= 0) {
      vector.x = roundFloat(vector.x, interimRounding);
      vector.y = roundFloat(vector.y, interimRounding);
    }

    if (vector.x === 0 && vector.y === 0) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'glide coords.x', to: vector.x},
      {desc: 'glide coords.y', to: vector.y}
    ]);
    
    this._animationStorage.createSurfaceGlide({x: vector.x, y: vector.y}, time, easingFormula);
    this._animationExecutor.initiate();

    return true;
  }

  public glideTo(coords: {x: number, y: number}, time: number = this.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseInOutSine, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    coords.x = roundFloat(coords.x, finalRounding);
    coords.y = roundFloat(coords.y, finalRounding);

    if (this._coords.x === coords.x && this._coords.y === coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'glideTo coords.x', from: this._coords.x, to: coords.x},
      {desc: 'glideTo coords.y', from: this._coords.y, to: coords.y}
    ]);

    return this.glide({x: coords.x - this._coords.x, y: coords.y - this._coords.y}, time, easingFormula, -1, finalRounding);
  }

  private _updateViewport() : void {
    this._viewport = {
      x: 0 - this.surfaceWidth / 2 + this.containerWidth / 2,
      y: 0 - this.surfaceHeight / 2 + this.containerHeight / 2
    }

    this.elements.viewport.style.top = this._viewport.y + 'px';
    this.elements.viewport.style.left = this._viewport.x + 'px';
  }

  public updateSkew(scale: number|null = null) : void {
    if (scale === null) {
      scale = this.scale.value;
    }
    let percentOfMaxScale = (scale - this.CONFIG.SCALE_MIN.VALUE) / (this.CONFIG.SCALE_MAX.VALUE - this.CONFIG.SCALE_MIN.VALUE);
    this._skew = {
      x: roundFloat(percentOfMaxScale * this.CONFIG.SKEW_X_MAX.VALUE, 2),
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
      `x: ${this._coords.x}\n` +
      `y: ${this._coords.y}\n` +
      `limit.x: ${this._limit.x}\n` +
      `limit.y: ${this._limit.y}\n` +
      `scale: ${this.scale.value}`
    );
  }

  public cancelOngoingMoves() : void {
    this._animationStorage.destroySurfaceGlide();
  }

  private _enforceLimits() : void {
    this.moveTo({x: clamp(this._coords.x, this.min.x, this.max.x), y: clamp(this._coords.y, this.min.y, this.max.y)});
  }
}