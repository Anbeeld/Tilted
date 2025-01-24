import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceZoom from './zoom.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import Surface from '../surface.js';
import { MouseParams } from '../controls/mouse.js';
import { EasingFunctions, roundFloat } from '../utils.js';

export default class AnimationStorage {
  private _surface: Surface;

  public surfaceGlide: AnimationSurfaceGlide | null = null;
  public surfaceZoom: AnimationSurfaceZoom | null = null;
  public surfaceEdge: AnimationSurfaceEdge | null = null;
  public surfaceDrag: AnimationSurfaceDrag | null = null;
  
  constructor(surface: Surface) {
    this._surface = surface;
  }
  
  public createSurfaceGlide(vector: {x: number, y: number}, animationTime: number, easingFormula: EasingFunctions) : void {
    if (this.surfaceGlideIsSet()) {
      vector = {
        x: roundFloat(vector.x + this.surfaceGlide!.remaining.x, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE),
        y: roundFloat(vector.y + this.surfaceGlide!.remaining.y, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE)
      }
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
  
  public createSurfaceZoom(shift: number, animationTime: number, easingFormula: EasingFunctions) : void {
    this.destroySurfaceZoom();
    this.surfaceZoom = new AnimationSurfaceZoom(this._surface, shift, animationTime, easingFormula);
  }
  public destroySurfaceZoom() : void {
    if (this.surfaceZoomIsSet()) {
      this.surfaceZoom!.destroy();
      this.surfaceZoom = null;
    }
  }
  public surfaceZoomIsSet() : boolean {
    return this.surfaceZoom !== null;
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