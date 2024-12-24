import Surface from '../index.js';
import AnimationStorage from './storage.js';

export default class AnimationExecutor {
  private surface: Surface;
  private animationStorage: AnimationStorage;

  private executing: boolean = false;
  
  constructor(surface: Surface, animationStorage: AnimationStorage) {
    this.surface = surface;
    this.animationStorage = animationStorage;
  }

  public initiate() : void {
    if (!this.executing) {
      this.executing = true;
      this.step();
    }
  }

  private step() : void {
    let timestampCurrent = performance.now();
    requestAnimationFrame(() => {
      this.executing = false || this.stepSurfaceGlide(timestampCurrent) || this.stepSurfaceEdge(timestampCurrent);
      if (this.executing) {
        this.step();
      }
    });
  }

  private stepSurfaceGlide(timestampCurrent: number) {
    if (!this.animationStorage.surfaceGlideIsSet()) {
      return false;
    }

    let shouldContinue = this.animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      this.animationStorage.destroySurfaceGlide();
    }
    
    return shouldContinue;
  }

  private stepSurfaceEdge(timestampCurrent: number) : boolean {
    if (!this.animationStorage.surfaceEdgeIsSet()) {
      return false;
    }

    let shouldContinue = this.animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      this.animationStorage.destroySurfaceEdge();
    }
    
    return shouldContinue;
  }
}