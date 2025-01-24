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

  public zoom(shift: number, time: number = this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, interimRounding: number = this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE) : number {
    let initialShift = shift;
    // Check if shift is zero
    if (shift === 0) {
      return 0;
    }
    // Add remaining shift of current animation if it exists
    shift = this._addCurrentZoom(shift);
    // Check if shift is zero
    if (shift === 0) {
      return 0;
    }
    // Change shift value so that current scale + shift would equal step value
    shift = this._roundToStep(shift);
    // Check if shift is zero
    if (shift === 0) {
      return 0;
    }
    // Round shift
    if (interimRounding >= 0) {
      shift = roundFloat(shift, interimRounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return 0;
    }
    // Perform animation
    this._surface.animationStorage.createSurfaceZoom(shift, time * clamp(Math.abs(shift / initialShift), 0, 1), easingFormula);
    this._surface.animationExecutor.initiate();
    // Indicate that there is change of scale
    return shift;
  }

  public zoomTo(value: number, time: number = this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc) : boolean {
    if (this._value === value) {
      return false;
    }
    return this.zoom(value - this._value, time, easingFormula, -1) > 0;
  }

  public step(steps: number) : boolean {
    let positive = steps > 0 ? true : false;
    return this._surface.scale.zoom(steps * this._surface.scale.stepSize(positive)) !== 0;
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let positive = steps > 0 ? true : false;

    if ((positive && this._projection === this._surface.CONFIG.SCALE_MAX.VALUE) || (!positive && this._projection === this._surface.CONFIG.SCALE_MIN.VALUE)) {
      return;
    }

    let shiftPerStep = this.stepSize(positive);

    let initialShift = steps * shiftPerStep;
    let actualShift = this.zoom(initialShift);

    if (actualShift !== 0 && mouse !== null) {
      let vector = this._surface.scale.glidePerStep(mouse, positive);
      let factor = actualShift / initialShift;
      console.log(factor);
      // vector.x *= factor;
      // vector.y *= factor;
      this._surface.glide(vector, this._surface.CONFIG.ANIMATION_GLIDE_TIME.VALUE * clamp(Math.abs(actualShift / initialShift), 0, 1));
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

  private _addCurrentZoom(shift: number) : number {
    if (this._surface.animationStorage.surfaceZoomIsSet() && this._surface.animationStorage.surfaceZoom!.remaining !== 0) {
      return shift + this._surface.animationStorage.surfaceZoom!.remaining;
    }
    return shift;
  }

  private get _projection() : number {
    let projection = this._surface.scale.value;
    if (this._surface.animationStorage.surfaceZoomIsSet() && this._surface.animationStorage.surfaceZoom!.remaining !== 0) {
      projection += this._surface.animationStorage.surfaceZoom!.remaining;
    }
    return clamp(roundFloat(projection, 4), this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE);
  }

  private _roundToStep(shift: number) : number {
    let projection = roundTo(
      clamp(this._surface.scale.value + shift, this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE),
      this._surface.scale.stepSize(shift > 0 ? true : false, this._surface.scale.value + shift)
    );
    return projection - this._surface.scale.value;
  }
}