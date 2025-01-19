import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction } from '../utils.js';
import Animation from './animation.js';
import Surface from '../index.js';

export default class AnimationSurfaceGlide extends Animation {
  private _initial: {x: number, y: number};
  private _vector: {
    x: {value: number, sign: number},
    y: {value: number, sign: number}
  };
  private _current: {x: number, y: number} = {x: 0, y: 0};
  private _target: {x: number, y: number};
  private _bezierEasing: EasingFunctions;
  private _animationTime: number;

  constructor(surface: Surface, vector: {x: number, y: number}, animationTime: number, easingFormula: EasingFunctions) {
    super(surface);

    this._initial = {
      x: surface.coords.x,
      y: surface.coords.y
    };

    this._target = {
      x: this._initial.x + vector.x,
      y: this._initial.y + vector.y
    };

    this._vector = {
      x: {
        value: Math.abs(vector.x),
        sign: vector.x > 0 ? 1 : -1
      },
      y: {
        value: Math.abs(vector.y),
        sign: vector.y > 0 ? 1 : -1
      }
    };

    this._animationTime = animationTime;

    this._bezierEasing = easingFormula;

    this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide created: x ' + this._vector.x.value + ', y ' + this._vector.y.value + ', initial.x ' + this._initial.x + ', initial.y ' + this._initial.y + ', target.x ' + this._target.x + ', target.y ' + this._target.y);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this._timestampStart) / this._animationTime);
    let moveRatio = clampRatio(applyEasingFunction(timeRatio, this._bezierEasing));

    if (moveRatio >= 1) {

      this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide finished: ' + (timestampCurrent - this._timestampStart) + 'ms, surface.coords.x ' + this._surface.coords.x + ', surface.coords.y ' + this._surface.coords.y + ', target.x ' + this._target.x + ', target.y ' + this._target.y);

      this._surface.moveTo({x: this._target.x, y: this._target.y});


      return false;

    } else { 
      let vector = {
        x: 0,
        y: 0
      };
      
      if (this._vector.x.value > 0 && this._vector.x.value > this._current.x) {
        vector.x = roundFloat(Math.max(0, this._vector.x.value * moveRatio - this._current.x), this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (this._vector.y.value > 0 && this._vector.y.value > this._current.y) {
        vector.y = roundFloat(Math.max(0, this._vector.y.value * moveRatio - this._current.y), this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (vector.x > 0 || vector.y > 0) {
        this._surface.move({x: vector.x * this._vector.x.sign, y: vector.y * this._vector.y.sign}, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._current.x = roundFloat(this._current.x + vector.x, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._current.y = roundFloat(this._current.y + vector.y, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._timestampLast = timestampCurrent;

        this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this._timestampStart) + 'ms, timeRatio ' + timeRatio + ', moveRatio ' + moveRatio + ', x ' + vector.x + ', y ' + vector.y);
      }
      return true;
    }
  }
}