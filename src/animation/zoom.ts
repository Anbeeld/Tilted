import { roundFloat, clampRatio, EasingFunctions, applyEasingFunction } from '../utils.js';
import Animation from './animation.js';

export default class AnimationSurfaceZoom extends Animation {
  private _initial!: number;
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
      sign: shift >= 0 ? 1 : -1
    };

    this.animationTime = animationTime;

    this.bezierEasing = easingFormula;
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    this.initTimestamps(timestampCurrent);

    let timeRatio = clampRatio((timestampCurrent - this.timestampStart) / this.animationTime);
    let shiftRatio = clampRatio(applyEasingFunction(timeRatio, this.bezierEasing));

    if (shiftRatio >= 1) {
      this.surface.scale.changeTo(this.target);
      return false;
    } else { 
      let step = 0;
      
      if (this.shift.value > 0 && this.shift.value > this.current) {
        step = roundFloat(Math.max(0, this.shift.value * shiftRatio - this.current), this.surface.CONFIG.SCALE_ROUNDING.VALUE);
      }

      if (step > 0) {
        let changed = this.surface.scale.change(step * this.shift.sign);
        if (!changed) {
          return false;
        }
        this.current = roundFloat(this.current + step, this.surface.CONFIG.SCALE_ROUNDING.VALUE);
        this.timestampLast = timestampCurrent;
      }
      return true;
    }
  }
}