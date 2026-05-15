import { Registry } from '../registry.js';
import { Animations } from './storage.js';

export default class AnimationExecutor {
  private surfaceId: number;
  private get surface() { return Registry.surface(this.surfaceId); }

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
      let surface = this.surface;
      if (!surface) {
        this.isExecuting = false;
        return;
      }

      let continueSurfaceGlide = this.stepSurfaceGlide(timestampCurrent);
      let continueSurfaceZoom = this.stepSurfaceZoom(timestampCurrent);
      let continueSurfaceEdge = this.stepSurfaceEdge(timestampCurrent);

      surface.applyTransformProperty();

      this.isExecuting = continueSurfaceGlide || continueSurfaceZoom || continueSurfaceEdge;
      if (this.isExecuting) {
        this.step();
      }
    });
  }

  private stepSurfaceGlide(timestampCurrent: number) {
    let surface = this.surface;
    if (!surface || !surface.animationStorage.exists(Animations.SurfaceGlide)) {
      return false;
    }

    let shouldContinue = surface.animationStorage.surfaceGlide!.step(timestampCurrent);
    if (!shouldContinue) {
      surface.animationStorage.destroy(Animations.SurfaceGlide);
    }
    
    return shouldContinue;
  }

  private stepSurfaceZoom(timestampCurrent: number) {
    let surface = this.surface;
    if (!surface || !surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return false;
    }

    let shouldContinue = surface.animationStorage.surfaceZoom!.step(timestampCurrent);
    if (!shouldContinue) {
      surface.animationStorage.destroy(Animations.SurfaceZoom);
    }
    
    return shouldContinue;
  }

  private stepSurfaceEdge(timestampCurrent: number) : boolean {
    let surface = this.surface;
    if (!surface || !surface.animationStorage.exists(Animations.SurfaceEdge)) {
      return false;
    }

    let shouldContinue = surface.animationStorage.surfaceEdge!.step(timestampCurrent);
    if (!shouldContinue) {
      surface.animationStorage.destroy(Animations.SurfaceEdge);
    }
    
    return shouldContinue;
  }
}
