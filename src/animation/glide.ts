import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction, Coords } from '../utils.js';
import Animation from './animation.js';
import Surface from '../surface.js';

export default class AnimationSurfaceGlide extends Animation {
  private _initial: Coords;
  private _vector: {
    x: {value: number, sign: number},
    y: {value: number, sign: number}
  };
  private _current: Coords = {x: 0, y: 0};
  private get _target(): Coords {
    return {
      x: this._initial.x + this._vector.x.value * this._vector.x.sign,
      y: this._initial.y + this._vector.y.value * this._vector.y.sign
    };
  }
  private _bezierEasing: EasingFunctions;
  private _animationTime: number;

  public get remaining() : Coords {
    return {
      x: (this._vector.x.value - this._current.x) * this._vector.x.sign,
      y: (this._vector.y.value - this._current.y) * this._vector.y.sign
    };
  }

  constructor(surface: Surface, vector: Coords, animationTime: number, easingFormula: EasingFunctions) {
    super(surface);

    this._initial = {
      x: surface.position.coords.x,
      y: surface.position.coords.y
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

    this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide created: x ' + this._vector.x.value * this._vector.x.sign + ', y ' + this._vector.y.value * this._vector.y.sign + ', initial.x ' + this._initial.x + ', initial.y ' + this._initial.y + ', target.x ' + this._target.x + ', target.y ' + this._target.y);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this._timestampStart) / this._animationTime);
    let moveRatio = clampRatio(applyEasingFunction(timeRatio, this._bezierEasing));

    if (moveRatio >= 1) {

      this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Glide finished: ' + (timestampCurrent - this._timestampStart) + 'ms, surface.coords.x ' + this._surface.position.coords.x + ', surface.coords.y ' + this._surface.position.coords.y + ', target.x ' + this._target.x + ', target.y ' + this._target.y);

      this._surface.position.moveTo({x: this._target.x, y: this._target.y});


      return false;

    } else { 
      let step = {
        x: 0,
        y: 0
      };
      
      if (this._vector.x.value > 0 && this._vector.x.value > this._current.x) {
        step.x = roundFloat(Math.max(0, this._vector.x.value * moveRatio - this._current.x), this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (this._vector.y.value > 0 && this._vector.y.value > this._current.y) {
        step.y = roundFloat(Math.max(0, this._vector.y.value * moveRatio - this._current.y), this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
      }

      if (step.x > 0 || step.y > 0) {
        this._surface.position.move({x: step.x * this._vector.x.sign, y: step.y * this._vector.y.sign}, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._current.x = roundFloat(this._current.x + step.x, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._current.y = roundFloat(this._current.y + step.y, this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE);
        this._timestampLast = timestampCurrent;

        // this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this._timestampStart) + 'ms, timeRatio ' + timeRatio + ', moveRatio ' + moveRatio + ', x ' + step.x + ', y ' + step.y);
      }
      return true;
    }
  }
}