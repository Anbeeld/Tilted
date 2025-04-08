import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceZoom from './zoom.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import { MouseParams } from '../controls/mouse.js';
import { EasingFunctions, Coords } from '../utils.js';
import { Register } from '../register.js';

export enum Animations {
  SurfaceGlide = 'surfaceGlide',
  SurfaceZoom = 'surfaceZoom',
  SurfaceEdge = 'surfaceEdge',
  SurfaceDrag = 'surfaceDrag'
};

export class AnimationStorage {
  private _surfaceId: number;
  private get _surface() { return Register.surface(this._surfaceId)!; }

  private _surfaceGlide: AnimationSurfaceGlide | null = null;
  public get surfaceGlide() : AnimationSurfaceGlide | null { return this._surfaceGlide; }

  private _surfaceZoom: AnimationSurfaceZoom | null = null;
  public get surfaceZoom() : AnimationSurfaceZoom | null { return this._surfaceZoom; }

  private _surfaceEdge: AnimationSurfaceEdge | null = null;
  public get surfaceEdge() : AnimationSurfaceEdge | null { return this._surfaceEdge; }

  private _surfaceDrag: AnimationSurfaceDrag | null = null;
  public get surfaceDrag() : AnimationSurfaceDrag | null { return this._surfaceDrag; }
  
  constructor(surfaceId: number) {
    this._surfaceId = surfaceId;
  }

  // Uses "as any" cause it's already limited by type
  public create(animation: Animations, args: any) : void {
    switch (animation) {
      case Animations.SurfaceGlide:
        // @ts-ignore
        this._createSurfaceGlide(...args);
        break;
      case Animations.SurfaceZoom:
        // @ts-ignore
        this._createSurfaceZoom(...args);
        break;
      case Animations.SurfaceEdge:
        // @ts-ignore
        this._createSurfaceEdge(...args);
        break;
      case Animations.SurfaceDrag:
        // @ts-ignore
        this._createSurfaceDrag(...args);
        break;
    }
    this._surface.animationExecutor.initiate();
  }
  public destroy(animation: Animations) : void {
    switch (animation) {
      case Animations.SurfaceGlide: return this._destroySurfaceGlide();
      case Animations.SurfaceZoom: return this._destroySurfaceZoom();
      case Animations.SurfaceEdge: return this._destroySurfaceEdge();
      case Animations.SurfaceDrag: return this._destroySurfaceDrag();
    }
  }
  public exists(animation: Animations) : boolean {
    switch (animation) {
      case Animations.SurfaceGlide: return this._existsSurfaceGlide();
      case Animations.SurfaceZoom: return this._existsSurfaceZoom();
      case Animations.SurfaceEdge: return this._existsSurfaceEdge();
      case Animations.SurfaceDrag: return this._existsSurfaceDrag();
    }
  }
  
  private _createSurfaceGlide(vector: Coords, animationTime: number, easingFormula: EasingFunctions) : void {
    this._destroySurfaceGlide();
    this._surfaceGlide = new AnimationSurfaceGlide(this._surface.id, vector, animationTime, easingFormula);
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
  
  private _createSurfaceZoom(shift: number, animationTime: number, easingFormula: EasingFunctions) : void {
    this._destroySurfaceZoom();
    this._surfaceZoom = new AnimationSurfaceZoom(this._surface.id, shift, animationTime, easingFormula);
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
  
  private _createSurfaceEdge(vector: Coords) : void {
    this._destroySurfaceGlide();
    this._destroySurfaceEdge();
    this._surfaceEdge = new AnimationSurfaceEdge(this._surface.id, vector);
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

  private _createSurfaceDrag(mouse: MouseParams) : void {
    this._destroySurfaceDrag();
    this._surfaceDrag = new AnimationSurfaceDrag(this._surface.id, mouse);
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