import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceZoom from './zoom.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import Surface from '../surface.js';
import { MouseParams } from '../controls/mouse.js';
import { EasingFunctions, roundFloat } from '../utils.js';

type Animation = 'surfaceGlide'|'surfaceZoom'|'surfaceEdge'|'surfaceDrag';

export default class AnimationStorage {
  private _surface: Surface;

  private _surfaceGlide: AnimationSurfaceGlide | null = null;
  public get surfaceGlide() : AnimationSurfaceGlide | null { return this._surfaceGlide; }

  private _surfaceZoom: AnimationSurfaceZoom | null = null;
  public get surfaceZoom() : AnimationSurfaceZoom | null { return this._surfaceZoom; }

  private _surfaceEdge: AnimationSurfaceEdge | null = null;
  public get surfaceEdge() : AnimationSurfaceEdge | null { return this._surfaceEdge; }

  private _surfaceDrag: AnimationSurfaceDrag | null = null;
  public get surfaceDrag() : AnimationSurfaceDrag | null { return this._surfaceDrag; }
  
  constructor(surface: Surface) {
    this._surface = surface;
  }

  // Uses "as any" cause it's already limited by type
  public create(animation: Animation, args: any) : void {
    switch (animation) {
      // @ts-ignore
      case 'surfaceGlide': return this._createSurfaceGlide(...args);
      // @ts-ignore
      case 'surfaceZoom': return this._createSurfaceZoom(...args);
      // @ts-ignore
      case 'surfaceEdge': return this._createSurfaceEdge(...args);
      // @ts-ignore
      case 'surfaceDrag': return this._createSurfaceDrag(...args);
    }
  }
  public destroy(animation: Animation) : void {
    switch (animation) {
      case 'surfaceGlide': return this._destroySurfaceGlide();
      case 'surfaceZoom': return this._destroySurfaceZoom();
      case 'surfaceEdge': return this._destroySurfaceEdge();
      case 'surfaceDrag': return this._destroySurfaceDrag();
    }
  }
  public exists(animation: Animation) : boolean {
    switch (animation) {
      case 'surfaceGlide': return this._existsSurfaceGlide();
      case 'surfaceZoom': return this._existsSurfaceZoom();
      case 'surfaceEdge': return this._existsSurfaceEdge();
      case 'surfaceDrag': return this._existsSurfaceDrag();
    }
  }
  
  // @ts-ignore
  private _createSurfaceGlide(vector: {x: number, y: number}, animationTime: number, easingFormula: EasingFunctions) : void {
    if (this._existsSurfaceGlide()) {
      vector = {
        x: roundFloat(vector.x + this._surfaceGlide!.remaining.x, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE),
        y: roundFloat(vector.y + this._surfaceGlide!.remaining.y, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE)
      }
      this._destroySurfaceGlide();
    }
    this._surfaceGlide = new AnimationSurfaceGlide(this._surface, vector, animationTime, easingFormula);
  }
  private _destroySurfaceGlide() : void {
    if (this._existsSurfaceGlide()) {
      this._surfaceGlide!.destroy();
      this._surfaceGlide = null;
    }
  }
  private _existsSurfaceGlide() : boolean {
    return this._surfaceGlide !== null;
  }
  
  // @ts-ignore
  private _createSurfaceZoom(shift: number, animationTime: number, easingFormula: EasingFunctions) : void {
    this._destroySurfaceZoom();
    this._surfaceZoom = new AnimationSurfaceZoom(this._surface, shift, animationTime, easingFormula);
  }
  private _destroySurfaceZoom() : void {
    if (this._existsSurfaceZoom()) {
      this._surfaceZoom!.destroy();
      this._surfaceZoom = null;
    }
  }
  private _existsSurfaceZoom() : boolean {
    return this._surfaceZoom !== null;
  }
  
  // @ts-ignore
  private _createSurfaceEdge(vector: {x: number, y: number}) : void {
    this._destroySurfaceEdge();
    this._surfaceEdge = new AnimationSurfaceEdge(this._surface, vector);
  }
  private _destroySurfaceEdge() : void {
    if (this._existsSurfaceEdge()) {
      this._surfaceEdge!.destroy();
      this._surfaceEdge = null;
    }
  }
  private _existsSurfaceEdge() : boolean {
    return this._surfaceEdge !== null;
  }

  // @ts-ignore
  private _createSurfaceDrag(mouse: MouseParams) : void {
    this._destroySurfaceDrag();
    this._surfaceDrag = new AnimationSurfaceDrag(this._surface, mouse);
  }
  private _destroySurfaceDrag() : void {
    if (this._existsSurfaceDrag()) {
      this._surfaceDrag!.destroy();
      this._surfaceDrag = null;
    }
  }
  private _existsSurfaceDrag() : boolean {
    return this._surfaceDrag !== null;
  }
}