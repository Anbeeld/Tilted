import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import Surface from '../index.js';
import { MouseParams } from '../controls/mouse.js';
import { EasingFunctions } from '../utils.js';

export default class AnimationStorage {
  private _surface: Surface;

  public surfaceGlide: AnimationSurfaceGlide | null = null;
  public surfaceEdge: AnimationSurfaceEdge | null = null;
  public surfaceDrag: AnimationSurfaceDrag | null = null;
  
  constructor(surface: Surface) {
    this._surface = surface;
  }
  
  public createSurfaceGlide(vector: {x: number, y: number}, animationTime: number, easingFormula: EasingFunctions) : void {
    if (this.surfaceGlideIsSet()) {
      vector.x += this.surfaceGlide!.remaining.x;
      vector.y += this.surfaceGlide!.remaining.y;
      this.destroySurfaceGlide();
    }
    this.surfaceGlide = new AnimationSurfaceGlide(this._surface, vector, animationTime, easingFormula);
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
    this.destroySurfaceEdge();
    this.surfaceEdge = new AnimationSurfaceEdge(this._surface, vector);
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
    this.destroySurfaceDrag();
    this.surfaceDrag = new AnimationSurfaceDrag(this._surface, mouse);
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