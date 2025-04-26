import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction, Coords } from '../utils.js';
import Animation from './animation.js';
import AnimationSurfaceZoom from './zoom.js';

export default class AnimationSurfaceGlide extends Animation {
  private initial: Coords;
  private vector: {
    x: {value: number, sign: number},
    y: {value: number, sign: number}
  };
  private current: Coords = {x: 0, y: 0};
  private get target(): Coords {
    return {
      x: this.initial.x + this.vector.x.value * this.vector.x.sign,
      y: this.initial.y + this.vector.y.value * this.vector.y.sign
    };
  }
  private bezierEasing: EasingFunctions;
  private animationTime: number;

  public get remaining() : Coords {
    return {
      x: (this.vector.x.value - this.current.x) * this.vector.x.sign,
      y: (this.vector.y.value - this.current.y) * this.vector.y.sign
    };
  }

  private zoom?: AnimationSurfaceZoom;

  constructor(surfaceId: number, vector: Coords, animationTime: number, easingFormula: EasingFunctions) {
    super(surfaceId);

    this.initial = {
      x: this.surface.position.coords.x,
      y: this.surface.position.coords.y
    };

    this.vector = {
      x: {
        value: Math.abs(vector.x),
        sign: vector.x > 0 ? 1 : -1
      },
      y: {
        value: Math.abs(vector.y),
        sign: vector.y > 0 ? 1 : -1
      }
    };

    this.animationTime = animationTime;

    this.bezierEasing = easingFormula;

    false && console.log('Glide created: x ' + this.vector.x.value * this.vector.x.sign + ', y ' + this.vector.y.value * this.vector.y.sign + ', initial.x ' + this.initial.x + ', initial.y ' + this.initial.y + ', target.x ' + this.target.x + ', target.y ' + this.target.y);
  }

  public tieWithZoomAnimation(zoomAnimation: AnimationSurfaceZoom) : void {
    this.zoom = zoomAnimation;
  }

  private adjustMoveByZoom(x: number): number {
    if (!this.zoom) {
      return x;
    }
    if (this.zoom.initial === this.zoom.target) {
      return x;
    }
    const scaleRatio = this.zoom.initial / this.zoom.target;
    return x / (scaleRatio + x * (1 - scaleRatio));
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }
    
    this.initTimestamps(timestampCurrent);

    let timeRatio = clampRatio((timestampCurrent - this.timestampStart) / this.animationTime);
    let moveRatio = clampRatio(this.adjustMoveByZoom(applyEasingFunction(timeRatio, this.bezierEasing)));

    if (moveRatio >= 1) {

      false && console.log('Glide finished: ' + (timestampCurrent - this.timestampStart) + 'ms, surface.coords.x ' + this.surface.position.coords.x + ', surface.coords.y ' + this.surface.position.coords.y + ', target.x ' + this.target.x + ', target.y ' + this.target.y);

      this.surface.position.moveTo({x: this.target.x, y: this.target.y});


      return false;

    } else { 
      let step = {
        x: 0,
        y: 0
      };
      
      if (this.vector.x.value > 0 && this.vector.x.value > this.current.x) {
        step.x = roundFloat(Math.max(0, this.vector.x.value * moveRatio - this.current.x), this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (this.vector.y.value > 0 && this.vector.y.value > this.current.y) {
        step.y = roundFloat(Math.max(0, this.vector.y.value * moveRatio - this.current.y), this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (step.x > 0 || step.y > 0) {
        this.surface.position.move({x: step.x * this.vector.x.sign, y: step.y * this.vector.y.sign}, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.current.x = roundFloat(this.current.x + step.x, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.current.y = roundFloat(this.current.y + step.y, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.timestampLast = timestampCurrent;

        false && console.log('time ' + (timestampCurrent - this.timestampStart) + 'ms, timeRatio ' + timeRatio + ', moveRatio ' + moveRatio + ', x ' + step.x + ', y ' + step.y);
      }
      return true;
    }
  }
}