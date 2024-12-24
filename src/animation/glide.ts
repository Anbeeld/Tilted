import { roundFloat, clampRatio } from '../utils.js';
import Animation from './animation.js';
import bezierEasing from 'bezier-easing';
import Surface from '../index.js';

export default class AnimationSurfaceGlide extends Animation {

  private initial: {x: number, y: number};

  private vector: {
    x: {value: number, sign: number},
    y: {value: number, sign: number}
  };

  private current: {x: number, y: number} = {x: 0, y: 0};

  private target: {x: number, y: number};

  private bezierEasing: any;

  private animationTime: number;

  constructor(surface: Surface, vector: {x: number, y: number}, animationTime: number, easingFormula: [number, number, number, number]) {
    super(surface);

    this.initial = {
      x: surface.coords.x,
      y: surface.coords.y
    };

    this.target = {
      x: this.initial.x + vector.x,
      y: this.initial.y + vector.y
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

    this.bezierEasing = bezierEasing(easingFormula[0], easingFormula[1], easingFormula[2], easingFormula[3]);

    this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide created: x ' + this.vector.x.value + ', y ' + this.vector.y.value + ', initial.x ' + this.initial.x + ', initial.y ' + this.initial.y + ', target.x ' + this.target.x + ', target.y ' + this.target.y);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this.timestampStart) / this.animationTime);
    let moveRatio = clampRatio(this.bezierEasing(timeRatio));

    if (moveRatio >= 1) {

      this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide finished: ' + (timestampCurrent - this.timestampStart) + 'ms, surface.coords.x ' + this.surface.coords.x + ', surface.coords.y ' + this.surface.coords.y + ', target.x ' + this.target.x + ', target.y ' + this.target.y);

      this.surface.moveTo({x: this.target.x, y: this.target.y});


      return false;

    } else { 
      let vector = {
        x: 0,
        y: 0
      };
      
      if (this.vector.x.value > 0 && this.vector.x.value > this.current.x) {
        vector.x = roundFloat(Math.max(0, this.vector.x.value * moveRatio - this.current.x), this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (this.vector.y.value > 0 && this.vector.y.value > this.current.y) {
        vector.y = roundFloat(Math.max(0, this.vector.y.value * moveRatio - this.current.y), this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (vector.x > 0 || vector.y > 0) {
        this.surface.move({x: vector.x * this.vector.x.sign, y: vector.y * this.vector.y.sign}, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.current.x = roundFloat(this.current.x + vector.x, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.current.y = roundFloat(this.current.y + vector.y, this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this.timestampLast = timestampCurrent;

        this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this.timestampStart) + 'ms, timeRatio ' + timeRatio + ', moveRatio ' + moveRatio + ', x ' + vector.x + ', y ' + vector.y);
      }
      return true;
    }
  }
}