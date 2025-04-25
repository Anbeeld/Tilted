import AnimationSurfaceGlide from './glide.js';
import AnimationSurfaceZoom from './zoom.js';
import AnimationSurfaceEdge from './edge.js';
import AnimationSurfaceDrag from './drag.js';
import { MouseParams } from '../controls/mouse.js';
import { EasingFunctions, Coords } from '../utils.js';
import { Register } from '../register.js';

export enum Animations {
  SurfaceGlide = 'surfaceGlide',
  SurfaceZoom = 'surfaceZoom',
  SurfaceEdge = 'surfaceEdge',
  SurfaceDrag = 'surfaceDrag'
};

export class AnimationStorage {
  private surfaceId: number;
  private get surface() { return Register.surface(this.surfaceId)!; }

  // @ts-ignore Doesn't understand setters and getters
  private _surfaceGlide: AnimationSurfaceGlide | null = null;
  private set surfaceGlide(value: AnimationSurfaceGlide | null) { this._surfaceGlide = value; }
  public get surfaceGlide() : AnimationSurfaceGlide | null { return this._surfaceGlide; }

  // @ts-ignore Doesn't understand setters and getters
  private _surfaceZoom: AnimationSurfaceZoom | null = null;
  private set surfaceZoom(value: AnimationSurfaceZoom | null) { this._surfaceZoom = value; }
  public get surfaceZoom() : AnimationSurfaceZoom | null { return this._surfaceZoom; }

  // @ts-ignore Doesn't understand setters and getters
  private _surfaceEdge: AnimationSurfaceEdge | null = null;
  private set surfaceEdge(value: AnimationSurfaceEdge | null) { this._surfaceEdge = value; }
  public get surfaceEdge() : AnimationSurfaceEdge | null { return this._surfaceEdge; }

  // @ts-ignore Doesn't understand setters and getters
  private _surfaceDrag: AnimationSurfaceDrag | null = null;
  private set surfaceDrag(value: AnimationSurfaceDrag | null) { this._surfaceDrag = value; }
  public get surfaceDrag() : AnimationSurfaceDrag | null { return this._surfaceDrag; }
  
  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
  }

  // Uses "as any" cause it's already limited by type
  public create(animation: Animations, args: any) : void {
    switch (animation) {
      case Animations.SurfaceGlide:
        // @ts-ignore
        this.createSurfaceGlide(...args);
        break;
      case Animations.SurfaceZoom:
        // @ts-ignore
        this.createSurfaceZoom(...args);
        break;
      case Animations.SurfaceEdge:
        // @ts-ignore
        this.createSurfaceEdge(...args);
        break;
      case Animations.SurfaceDrag:
        // @ts-ignore
        this.createSurfaceDrag(...args);
        break;
    }
    this.surface.animationExecutor.initiate();
  }
  public destroy(animation: Animations) : void {
    switch (animation) {
      case Animations.SurfaceGlide: return this.destroySurfaceGlide();
      case Animations.SurfaceZoom: return this.destroySurfaceZoom();
      case Animations.SurfaceEdge: return this.destroySurfaceEdge();
      case Animations.SurfaceDrag: return this.destroySurfaceDrag();
    }
  }
  public exists(animation: Animations) : boolean {
    switch (animation) {
      case Animations.SurfaceGlide: return this.existsSurfaceGlide();
      case Animations.SurfaceZoom: return this.existsSurfaceZoom();
      case Animations.SurfaceEdge: return this.existsSurfaceEdge();
      case Animations.SurfaceDrag: return this.existsSurfaceDrag();
    }
  }
  
  private createSurfaceGlide(vector: Coords, animationTime: number, easingFormula: EasingFunctions) : void {
    this.destroySurfaceGlide();
    this.surfaceGlide = new AnimationSurfaceGlide(this.surface.id, vector, animationTime, easingFormula);
  }
  private destroySurfaceGlide() : void {
    if (this.existsSurfaceGlide()) {
      this.surfaceGlide!.destroy();
      this.surfaceGlide = null;
    }
  }
  private existsSurfaceGlide() : boolean {
    return this.surfaceGlide !== null;
  }
  
  private createSurfaceZoom(shift: number, animationTime: number, easingFormula: EasingFunctions) : void {
    this.destroySurfaceZoom();
    this.surfaceZoom = new AnimationSurfaceZoom(this.surface.id, shift, animationTime, easingFormula);
  }
  private destroySurfaceZoom() : void {
    if (this.existsSurfaceZoom()) {
      this.surfaceZoom!.destroy();
      this.surfaceZoom = null;
    }
  }
  private existsSurfaceZoom() : boolean {
    return this.surfaceZoom !== null;
  }
  
  private createSurfaceEdge(vector: Coords) : void {
    this.destroySurfaceGlide();
    this.destroySurfaceEdge();
    this.surfaceEdge = new AnimationSurfaceEdge(this.surface.id, vector);
  }
  private destroySurfaceEdge() : void {
    if (this.existsSurfaceEdge()) {
      this.surfaceEdge!.destroy();
      this.surfaceEdge = null;
    }
  }
  private existsSurfaceEdge() : boolean {
    return this.surfaceEdge !== null;
  }

  private createSurfaceDrag(mouse: MouseParams) : void {
    this.destroySurfaceDrag();
    this.surfaceDrag = new AnimationSurfaceDrag(this.surface.id, mouse);
  }
  private destroySurfaceDrag() : void {
    if (this.existsSurfaceDrag()) {
      this.surfaceDrag!.destroy();
      this.surfaceDrag = null;
    }
  }
  private existsSurfaceDrag() : boolean {
    return this.surfaceDrag !== null;
  }
}