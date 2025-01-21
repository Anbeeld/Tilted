import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction } from '../utils.js';
import Animation from './animation.js';
import Surface from '../surface.js';

export default class AnimationSurfaceZoom extends Animation {
  private _initial: number;
  private _change: {value: number, sign: number};
  private _current: number = 0;
  private get _target(): number {
    return this._initial + this._change.value * this._change.sign;
  }
  private _bezierEasing: EasingFunctions;
  private _animationTime: number;

  public get remaining() : number {
    return (this._change.value - this._current) * this._change.sign;
  }

  constructor(surface: Surface, change: number, animationTime: number, easingFormula: EasingFunctions) {
    super(surface);

    this._initial = surface.scale.value;

    this._change = {
      value: Math.abs(change),
      sign: change > 0 ? 1 : -1
    };

    this._animationTime = animationTime;

    this._bezierEasing = easingFormula;

    this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom created: change ' + this._change.value + ', initial ' + this._initial + ', target ' + this._target);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this._timestampStart) / this._animationTime);
    let moveRatio = clampRatio(applyEasingFunction(timeRatio, this._bezierEasing));

    if (moveRatio >= 1) {
      // this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom finished: ' + (timestampCurrent - this._timestampStart) + 'ms, surface.coords.x ' + this._surface.coords.x + ', surface.coords.y ' + this._surface.coords.y + ', target.x ' + this._target.x + ', target.y ' + this._target.y);

      this._surface.scale.changeTo(this._target);
      return false;
    } else { 
      let step = 0;
      
      if (this._change.value > 0 && this._change.value > this._current) {
        step = roundFloat(Math.max(0, this._change.value * moveRatio - this._current), this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE);
      }

      if (step > 0) {
        this._surface.scale.change(step * this._change.sign);
        this._current = roundFloat(this._current + step, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE);
        this._timestampLast = timestampCurrent;

        this._surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this._timestampStart) + 'ms, timeRatio ' + timeRatio + ', moveRatio ' + moveRatio + ', step ' + step);
      }
      return true;
    }
  }
}