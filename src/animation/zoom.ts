import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction } from '../utils.js';
import Animation from './animation.js';

export default class AnimationSurfaceZoom extends Animation {
  private _initial: number;
  private _shift: {value: number, sign: number};
  private _current: number = 0;
  private get _target(): number {
    return this._initial + this._shift.value * this._shift.sign;
  }
  private _bezierEasing: EasingFunctions;
  private _animationTime: number;

  public get remaining() : number {
    return (this._shift.value - this._current) * this._shift.sign;
  }

  constructor(surfaceId: number, shift: number, animationTime: number, easingFormula: EasingFunctions) {
    super(surfaceId);

    this._initial = this._surface.scale.value;

    this._shift = {
      value: Math.abs(shift),
      sign: shift > 0 ? 1 : -1
    };

    this._animationTime = animationTime;

    this._bezierEasing = easingFormula;

    this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom created: shift ' + this._shift.value + ', initial ' + this._initial + ', target ' + this._target);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this._timestampStart) / this._animationTime);
    let shiftRatio = clampRatio(applyEasingFunction(timeRatio, this._bezierEasing));

    if (shiftRatio >= 1) {
      this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom finished: ' + (timestampCurrent - this._timestampStart) + 'ms, surface.scale.value ' + this._surface.scale.value + ', target ' + this._target);

      this._surface.scale.changeTo(this._target);
      return false;
    } else { 
      let step = 0;
      
      if (this._shift.value > 0 && this._shift.value > this._current) {
        step = roundFloat(Math.max(0, this._shift.value * shiftRatio - this._current), this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE);
      }

      if (step > 0) {
        this._surface.scale.change(step * this._shift.sign);
        this._current = roundFloat(this._current + step, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE);
        this._timestampLast = timestampCurrent;

        // this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this._timestampStart) + 'ms, timeRatio ' + timeRatio + ', shiftRatio ' + shiftRatio + ', step ' + step);
      }
      return true;
    }
  }
}