import { Register } from '../register.js';
import { Animations } from './storage.js';

export default class AnimationExecutor {
  private surfaceId: number;
  private get surface() { return Register.surface(this.surfaceId)!; }

  private isExecuting: boolean = false;
  
  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
  }

  public initiate() : void {
    if (!this.isExecuting) {
      this.isExecuting = true;
      this.step();
    }
  }

  private step() : void {
    requestAnimationFrame((timestampCurrent) => {
      let continueSurfaceGlide = this.stepSurfaceGlide(timestampCurrent);
      let continueSurfaceZoom = this.stepSurfaceZoom(timestampCurrent);
      let continueSurfaceEdge = this.stepSurfaceEdge(timestampCurrent);

      this.surface.applyTransformProperty();

      this.isExecuting = false || continueSurfaceGlide || continueSurfaceZoom || continueSurfaceEdge;
      if (this.isExecuting) {
        this.step();
      }
    });
  }

  private stepSurfaceGlide(timestampCurrent: number) {
    if (!this.surface.animationStorage.exists(Animations.SurfaceGlide)) {
      return false;
    }

    let shouldContinue = this.surface.animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      this.surface.animationStorage.destroy(Animations.SurfaceGlide);
    }
    
    return shouldContinue;
  }

  private stepSurfaceZoom(timestampCurrent: number) {
    if (!this.surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return false;
    }

    let shouldContinue = this.surface.animationStorage.surfaceZoom!.step(timestampCurrent);
    if (!shouldContinue) {
      this.surface.animationStorage.destroy(Animations.SurfaceZoom);
    }
    
    return shouldContinue;
  }

  private stepSurfaceEdge(timestampCurrent: number) : boolean {
    if (!this.surface.animationStorage.exists(Animations.SurfaceEdge)) {
      return false;
    }

    let shouldContinue = this.surface.animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      this.surface.animationStorage.destroy(Animations.SurfaceEdge);
    }
    
    return shouldContinue;
  }
}