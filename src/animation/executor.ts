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
      this._isExecuting = false || this._stepSurfaceGlide(timestampCurrent) || this._stepSurfaceEdge(timestampCurrent);
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