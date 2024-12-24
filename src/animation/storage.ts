import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import Surface from '../index.js';
import { MouseParams } from '../controls/mouse.js';

export default class AnimationStorage {
  private surface: Surface;

  public surfaceGlide: AnimationSurfaceGlide | null = null;
  public surfaceEdge: AnimationSurfaceEdge | null = null;
  public surfaceDrag: AnimationSurfaceDrag | null = null;
  
  constructor(surface: Surface) {
    this.surface = surface;
  }
  
  public createSurfaceGlide(vector: {x: number, y: number}, animationTime: number, easingFormula: [number, number, number, number]) : void {
    this.surfaceGlide = new AnimationSurfaceGlide(this.surface, vector, animationTime, easingFormula);
  }
  public destroySurfaceGlide() : void {
    if (this.surfaceGlideIsSet()) {
      this.surfaceGlide!.destroy();
      this.surfaceGlide = null;
    }
  }
  public surfaceGlideIsSet() : boolean {
    return this.surfaceGlide !== null;
  }
  
  public createSurfaceEdge(vector: {x: number, y: number}) : void {
    this.surfaceEdge = new AnimationSurfaceEdge(this.surface, vector);
  }
  public destroySurfaceEdge() : void {
    if (this.surfaceEdgeIsSet()) {
      this.surfaceEdge!.destroy();
      this.surfaceEdge = null;
    }
  }
  public surfaceEdgeIsSet() : boolean {
    return this.surfaceEdge !== null;
  }

  public createSurfaceDrag(mouse: MouseParams) : void {
    this.surfaceDrag = new AnimationSurfaceDrag(this.surface, mouse);
  }
  public destroySurfaceDrag() : void {
    if (this.surfaceDragIsSet()) {
      this.surfaceDrag!.destroy();
      this.surfaceDrag = null;
    }
  }
  public surfaceDragIsSet() : boolean {
    return this.surfaceDrag !== null;
  }
}