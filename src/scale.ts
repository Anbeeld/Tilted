import Surface from './surface.js';
import { clamp, EasingFunctions, roundFloat, roundTo } from './utils.js';
import { MouseParams } from './controls/mouse.js';

export default class Scale {
  protected _surface: Surface;
  public _value: number;

  constructor(surface: Surface, value: number) {
    this._surface = surface;
    this._value = value;

    this._surface.updateSkew(this._value);
    this._surface.elements.scale.style.transform = 'scale(' + this._value + ') perspective(' + this._surface.CONFIG.PERSPECTIVE_DISTANCE.VALUE + 'px) rotate3d(1, 0, 0, ' + this._surface.skew.x + 'deg)';
  }

  public get value() : number {
    return this._value;
  }

  public change(shift: number, interimRounding: number = this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE, finalRounding: number = this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE) : boolean {
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Round shift
    if (interimRounding >= 0) {
      shift = roundFloat(shift, interimRounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Calculate scale result with limits and final rounding
    let result;
    if (finalRounding >= 0) {
      result = roundFloat(this._value + shift, finalRounding);
    } else {
      result = this._value + shift;
    }
    result = clamp(result, this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE)
    // Check if scale will change
    if (result === this._value) {
      return false;
    }
    // Set surface scale to a new value
    this._value = result;
    this._surface.updateSkew();
    this._surface.elements.scale.style.transform = 'scale(' + this._value + ') perspective(' + this._surface.CONFIG.PERSPECTIVE_DISTANCE.VALUE + 'px) rotate3d(1, 0, 0, ' + this._surface.skew.x + 'deg)';
    // Indicate that there was a change of scale
    return true;
  }

  public changeTo(value: number, finalRounding: number = this._surface.CONFIG.SCALE_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      value = roundFloat(value, finalRounding);
    }
    if (this._value === value) {
      return false;
    }
    return this.change(value - this._value, -1, finalRounding);
  }

  public zoom(shift: number, interimRounding: number = this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE, finalRounding: number = this._surface.CONFIG.SCALE_ROUNDING_FINAL.VALUE) : boolean {
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Round shift
    if (interimRounding >= 0) {
      shift = roundFloat(shift, interimRounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Calculate zoom result with final rounding
    let result;
    if (finalRounding >= 0) {
      result = roundFloat(this._value + shift, finalRounding);
    } else {
      result = this._value + shift;
    }
    // Set shift = result - current, enforsing limits and final rounding
    shift = clamp(result, this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE) - this._value;
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Round shift
    if (interimRounding >= 0) {
      shift = roundFloat(shift, interimRounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Perform animation
    this._surface.animationStorage.createSurfaceZoom(shift, 400, EasingFunctions.EaseOutCirc);
    this._surface.animationExecutor.initiate();
    // Indicate that there is change of scale
    return true;
  }

  public zoomTo(value: number, finalRounding: number = this._surface.CONFIG.SCALE_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      value = roundFloat(value, finalRounding);
    }
    if (this._value === value) {
      return false;
    }
    return this.zoom(value - this._value, -1, finalRounding);
  }

  public step(steps: number) : boolean {
    let positive = steps > 0 ? true : false;
    return this._surface.scale.zoom(steps * this._surface.scale.stepSize(positive));
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let positive = steps > 0 ? true : false;
    let glide;
    if (mouse === null) {
      glide = null;
    } else {
      glide = this._surface.scale.glidePerStep(mouse, positive);

      if (this._surface.animationStorage.surfaceZoomIsSet()) {
        let currentTarget = roundFloat(this._value + this._surface.animationStorage.surfaceZoom!.remaining, this._surface.CONFIG.SCALE_ROUNDING_FINAL.VALUE);
        if ((!positive && currentTarget === this._surface.CONFIG.SCALE_MIN.VALUE)
            || (positive && currentTarget === this._surface.CONFIG.SCALE_MAX.VALUE)) {
          glide = null;
        }
      }
    }

    let scaleChanged = this._surface.scale.step(steps);
    if (scaleChanged && mouse !== null && glide !== null) {
      this._surface.glide({x: glide.x, y: glide.y});
    }
  }

  public stepSize(positive: boolean, value?: number) : number {
    if (value === undefined) {
      value = this._value;
    }
    if ((positive && value < this._surface.CONFIG.SCALE_DEFAULT.VALUE) || (!positive && value <= this._surface.CONFIG.SCALE_DEFAULT.VALUE)) {
      return (this._surface.CONFIG.SCALE_DEFAULT.VALUE - this._surface.CONFIG.SCALE_MIN.VALUE) * this._surface.CONFIG.SCALE_STEP.VALUE;
    } else {
      return (this._surface.CONFIG.SCALE_MAX.VALUE - this._surface.CONFIG.SCALE_DEFAULT.VALUE) * this._surface.CONFIG.SCALE_STEP.VALUE;
    }
  }

  public glidePerStep(mouse: MouseParams, positive: boolean) : {x: number, y: number} {
    let positiveMultiplier = positive ? 1 : -1;
    let scaleValue = positive ? this._value + this._surface.scale.stepSize(true) : this._value;
    return {
      x: roundFloat((mouse.x - this._surface.containerWidth / 2) * this._surface.CONFIG.SCALE_GLIDE.VALUE / scaleValue, this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) * positiveMultiplier,
      y: roundFloat((mouse.y - this._surface.containerHeight / 2) * this._surface.CONFIG.SCALE_GLIDE.VALUE / scaleValue, this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) * positiveMultiplier
    }
  }

  public roundToStep(shift: number) : number {
    let projection = roundTo(
      clamp(roundFloat(this._surface.scale.value + shift, this._surface.CONFIG.SCALE_ROUNDING_FINAL.VALUE), this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE),
      this._surface.scale.stepSize(shift > 0 ? true : false, this._surface.scale.value + shift)
    );
    shift = roundFloat(projection - this._surface.scale.value, this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE);
    return shift;
  }
}