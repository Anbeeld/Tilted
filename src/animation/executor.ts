import { getSurface } from '../register.js';
import { Animations } from './storage.js';

export default class AnimationExecutor {
  private _surfaceId: number;
  private get _surface() { return getSurface(this._surfaceId); }

  private _isExecuting: boolean = false;
  
  constructor(surfaceId: number) {
    this._surfaceId = surfaceId;
  }

  public initiate() : void {
    if (!this._isExecuting) {
      this._isExecuting = true;
      this._step();
    }
  }

  private _step() : void {
    let timestampCurrent = performance.now();
    requestAnimationFrame(() => {
      let continueSurfaceGlide = this._stepSurfaceGlide(timestampCurrent);
      let continueSurfaceZoom = this._stepSurfaceZoom(timestampCurrent);
      let continueSurfaceEdge = this._stepSurfaceEdge(timestampCurrent);

      this._surface.applyTransformProperty();

      this._isExecuting = false || continueSurfaceGlide || continueSurfaceZoom || continueSurfaceEdge;
      if (this._isExecuting) {
        this._step();
      }
    });
  }

  private _stepSurfaceGlide(timestampCurrent: number) {
    if (!this._surface.animationStorage.exists(Animations.SurfaceGlide)) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroy(Animations.SurfaceGlide);
    }
    
    return shouldContinue;
  }

  private _stepSurfaceZoom(timestampCurrent: number) {
    if (!this._surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceZoom!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroy(Animations.SurfaceZoom);
    }
    
    return shouldContinue;
  }

  private _stepSurfaceEdge(timestampCurrent: number) : boolean {
    if (!this._surface.animationStorage.exists(Animations.SurfaceEdge)) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroy(Animations.SurfaceEdge);
    }
    
    return shouldContinue;
  }
}