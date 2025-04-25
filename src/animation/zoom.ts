import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction } from '../utils.js';
import Animation from './animation.js';

export default class AnimationSurfaceZoom extends Animation {
  // @ts-ignore Doesn't understand setters and getters
  private _initial: number;
  private set initial(value: number) { this._initial = value; }
  public get initial() { return this._initial; }

  private shift: {value: number, sign: number};
  private current: number = 0;

  public get target(): number { return this.initial + this.shift.value * this.shift.sign; }

  private bezierEasing: EasingFunctions;
  private animationTime: number;

  public get remaining() : number {
    return (this.shift.value - this.current) * this.shift.sign;
  }

  constructor(surfaceId: number, shift: number, animationTime: number, easingFormula: EasingFunctions) {
    super(surfaceId);

    this.initial = this.surface.scale.value;

    this.shift = {
      value: Math.abs(shift),
      sign: shift > 0 ? 1 : -1
    };

    this.animationTime = animationTime;

    this.bezierEasing = easingFormula;

    this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom created: shift ' + this.shift.value + ', initial ' + this.initial + ', target ' + this.target);
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeRatio = clampRatio((timestampCurrent - this.timestampStart) / this.animationTime);
    let shiftRatio = clampRatio(applyEasingFunction(timeRatio, this.bezierEasing));

    if (shiftRatio >= 1) {
      this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('Zoom finished: ' + (timestampCurrent - this.timestampStart) + 'ms, surface.scale.value ' + this.surface.scale.value + ', target ' + this.target);

      this.surface.scale.changeTo(this.target);
      return false;
    } else { 
      let step = 0;
      
      if (this.shift.value > 0 && this.shift.value > this.current) {
        step = roundFloat(Math.max(0, this.shift.value * shiftRatio - this.current), this.surface.CONFIG.SCALE_ROUNDING.VALUE);
      }

      if (step > 0) {
        this.surface.scale.change(step * this.shift.sign);
        this.current = roundFloat(this.current + step, this.surface.CONFIG.SCALE_ROUNDING.VALUE);
        this.timestampLast = timestampCurrent;

        // this.surface.CONFIG.DEBUG_MODE.VALUE && console.log('time ' + (timestampCurrent - this.timestampStart) + 'ms, timeRatio ' + timeRatio + ', shiftRatio ' + shiftRatio + ', step ' + step);
      }
      return true;
    }
  }
}