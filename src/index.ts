import { v4 as uuidv4 } from 'uuid';

import { roundFloat, clamp } from './utils.js';
import { ConfigProperties, setupConfig } from './config.js';
import { initControls } from './controls/controls.js';

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
  public uuid: string = uuidv4();

  public CONFIG: ConfigProperties;

  public elements: SurfaceElements;
  public styles: SurfaceStyles;

  public scale: Scale;
  public animationExecutor: AnimationExecutor;
  public animationStorage: AnimationStorage;

  private _viewport = {x: 0, y: 0};
  public get viewport() : {x: number, y: number} {
    return {x: this._viewport.x, y: this._viewport.y};
  }

  private _coords = {x: 0, y: 0};
  public get coords() : {x: number, y: number} {
    return {x: this._coords.x, y: this._coords.y};
  }

  private _skew = {x: 0, y: 0};
  public get skew() : {x: number, y: number} {
    return {x: this._skew.x, y: this._skew.y};
  }

  public constructor(elementContainer: HTMLElement, elementMap: HTMLElement, config: {} = {}) {
    this.CONFIG = setupConfig(config);

    this.elements = this.setupElements(elementContainer, elementMap);
    this.styles = this.setupStyles();

    this.animationStorage = new AnimationStorage(this);
    this.animationExecutor = new AnimationExecutor(this, this.animationStorage);

    initControls(this);

    this.updateViewport();
    new ResizeObserver(() => {this.updateCssDynamic();this.updateViewport();this.enforceLimits();}).observe(this.elements.container);
    new ResizeObserver(() => {this.updateCssDynamic();this.enforceLimits();}).observe(this.elements.surface);

    this.scale = new Scale(this, this.CONFIG.SCALE_DEFAULT.VALUE);
  }

  private setupElements(elementContainer: HTMLElement, elementMap: HTMLElement) : SurfaceElements {
    elementContainer.classList.add('tilted-container-' + this.uuid);

    let elementViewport = document.createElement('div');
    elementViewport.classList.add('tilted-viewport-' + this.uuid);

    let elementScale = document.createElement('div');
    elementScale.classList.add('tilted-scale-' + this.uuid);

    let elementPosition = document.createElement('div');
    elementPosition.classList.add('tilted-position-' + this.uuid);

    elementMap.classList.add('tilted-surface-' + this.uuid);

    let elementControls = document.createElement('div');
    elementControls.classList.add('tilted-controls-' + this.uuid);
    let elementControlsZoomIn = document.createElement('div');
    elementControlsZoomIn.classList.add('tilted-controls-zoom-in-' + this.uuid);
    let elementControlsZoomOut = document.createElement('div');
    elementControlsZoomOut.classList.add('tilted-controls-zoom-out-' + this.uuid);
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

  private setupStyles() : SurfaceStyles {
    let elementStyleStatic = document.createElement('style');
    elementStyleStatic.classList.add('tilted-css-static-' + this.uuid);
    elementStyleStatic.innerHTML = generateCssStatic(this);
    document.head.appendChild(elementStyleStatic);

    let elementStyleDynamic = document.createElement('style');
    elementStyleDynamic.classList.add('tilted-css-dynamic-' + this.uuid);
    elementStyleDynamic.innerHTML = generateCssDynamic(this);
    document.head.appendChild(elementStyleDynamic);

    return {
      static: elementStyleStatic,
      dynamic: elementStyleDynamic
    };
  }

  private updateCssDynamic() : void {
    this.styles.dynamic.innerHTML = generateCssDynamic(this);
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

  private get limit() : {x: number, y: number} {
    return {
      x: Math.round(this.surfaceWidth / 2 - this.containerWidth * 0.25),
      y: Math.round(this.surfaceHeight / 2 - this.containerHeight * 0.25)
    };
  }
  public get min() : {x: number, y: number} {
    return {
      x: this.limit.x * -1,
      y: this.limit.y * -1
    };
  }
  public get max() : {x: number, y: number} {
    return {
      x: this.limit.x,
      y: this.limit.y
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
      x: clamp(roundFloat(this.coords.x + vector.x, finalRounding), this.min.x, this.max.x),
      y: clamp(roundFloat(this.coords.y + vector.y, finalRounding), this.min.y, this.max.y)
    };

    if (coords.x === this.coords.x && coords.y === this.coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'move coords.x', from: this.coords.x, to: coords.x},
      {desc: 'move coords.y', from: this.coords.y, to: coords.y}
    ]);

    this._coords = coords;

    this.elements.position.style.transform = 'translate3d(' + (this.coords.x * -1) + 'px, ' + (this.coords.y * -1) + 'px, 0)';

    return true;
  }

  public moveTo(coords: {x: number, y: number}, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    coords.x = roundFloat(coords.x, finalRounding);
    coords.y = roundFloat(coords.y, finalRounding);

    if (this.coords.x === coords.x && this.coords.y === coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'moveTo coords.x', from: this.coords.x, to: coords.x},
      {desc: 'moveTo coords.y', from: this.coords.y, to: coords.y}
    ]);

    return this.move({x: coords.x - this.coords.x, y: coords.y - this.coords.y}, -1, finalRounding);
  }

  public glide(vector: {x: number, y: number}, time: number = this.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: [number, number, number, number] = [0.25, 0.1, 0.25, 1], interimRounding: number = this.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      vector.x = roundFloat(this.coords.x + vector.x, finalRounding) - this.coords.x;
      vector.y = roundFloat(this.coords.y + vector.y, finalRounding) - this.coords.y;
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
    
    this.animationStorage.createSurfaceGlide({x: vector.x, y: vector.y}, time, easingFormula);
    this.animationExecutor.initiate();

    return true;
  }

  public glideTo(coords: {x: number, y: number}, time: number = this.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: [number, number, number, number] = [0.25, 0.1, 0.25, 1], finalRounding: number = this.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    coords.x = roundFloat(coords.x, finalRounding);
    coords.y = roundFloat(coords.y, finalRounding);

    if (this.coords.x === coords.x && this.coords.y === coords.y) {
      return false;
    }

    this.CONFIG.DEBUG_MODE.VALUE && this.log([
      {desc: 'glideTo coords.x', from: this.coords.x, to: coords.x},
      {desc: 'glideTo coords.y', from: this.coords.y, to: coords.y}
    ]);

    return this.glide({x: coords.x - this.coords.x, y: coords.y - this.coords.y}, time, easingFormula, -1, finalRounding);
  }

  private updateViewport() : void {
    this._viewport = {
      x: 0 - this.surfaceWidth / 2 + this.containerWidth / 2,
      y: 0 - this.surfaceHeight / 2 + this.containerHeight / 2
    }

    this.elements.viewport.style.top = this.viewport.y + 'px';
    this.elements.viewport.style.left = this.viewport.x + 'px';
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
      `x: ${this.coords.x}\n` +
      `y: ${this.coords.y}\n` +
      `limit.x: ${this.limit.x}\n` +
      `limit.y: ${this.limit.y}\n` +
      `scale: ${this.scale.value}`
    );
  }

  public cancelOngoingMoves() : void {
    this.animationStorage.destroySurfaceGlide();
  }

  private enforceLimits() : void {
    this.moveTo({x: clamp(this.coords.x, this.min.x, this.max.x), y: clamp(this.coords.y, this.min.y, this.max.y)});
  }
}