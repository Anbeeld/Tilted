import AnimationStorage from './storage.js';

export default class AnimationExecutor {
  private _animationStorage: AnimationStorage;

  private _isExecuting: boolean = false;
  
  constructor(animationStorage: AnimationStorage) {
    this._animationStorage = animationStorage;
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

      this._isExecuting = false || continueSurfaceGlide || continueSurfaceZoom || continueSurfaceEdge;
      if (this._isExecuting) {
        this._step();
      }
    });
  }

  private _stepSurfaceGlide(timestampCurrent: number) {
    if (!this._animationStorage.surfaceGlideIsSet()) {
      return false;
    }

    let shouldContinue = this._animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      this._animationStorage.destroySurfaceGlide();
    }
    
    return shouldContinue;
  }

  private _stepSurfaceZoom(timestampCurrent: number) {
    if (!this._animationStorage.surfaceZoomIsSet()) {
      return false;
    }

    let shouldContinue = this._animationStorage.surfaceZoom!.step(timestampCurrent);
    if (!shouldContinue) {
      this._animationStorage.destroySurfaceZoom();
    }
    
    return shouldContinue;
  }

  private _stepSurfaceEdge(timestampCurrent: number) : boolean {
    if (!this._animationStorage.surfaceEdgeIsSet()) {
      return false;
    }

    let shouldContinue = this._animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      this._animationStorage.destroySurfaceEdge();
    }
    
    return shouldContinue;
  }
}