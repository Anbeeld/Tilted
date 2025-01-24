import Surface from '../surface.js';

export default class AnimationExecutor {
  protected _surface: Surface; 

  private _isExecuting: boolean = false;
  
  constructor(surface: Surface) {
    this._surface = surface;
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
    if (!this._surface.animationStorage.surfaceGlideIsSet()) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroySurfaceGlide();
    }
    
    return shouldContinue;
  }

  private _stepSurfaceZoom(timestampCurrent: number) {
    if (!this._surface.animationStorage.surfaceZoomIsSet()) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceZoom!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroySurfaceZoom();
    }
    
    return shouldContinue;
  }

  private _stepSurfaceEdge(timestampCurrent: number) : boolean {
    if (!this._surface.animationStorage.surfaceEdgeIsSet()) {
      return false;
    }

    let shouldContinue = this._surface.animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      this._surface.animationStorage.destroySurfaceEdge();
    }
    
    return shouldContinue;
  }
}