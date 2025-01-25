import Surface from './surface.js';
import { clamp, clampRatio, EasingFunctions, roundFloat, roundTo } from './utils.js';
import { MouseParams } from './controls/mouse.js';
import { Animations } from './animation/storage.js';

export default class Scale {
  protected _surface: Surface;
  public _value: number;

  constructor(surface: Surface, value: number) {
    this._surface = surface;
    this._value = value;

    this._surface.updateRotate(this._value);
    this._setTransformValues(true);
  }

  public get value() : number {
    return this._value;
  }

  private _setTransformValues(immediately: boolean = false) : void {
    this._surface.setTransformValues([
      {
        name: 'scale',
        value: this._value.toString()
      },
      {
        name: 'perspective',
        value: this._surface.CONFIG.PERSPECTIVE_DISTANCE.VALUE + 'px'
      },
      {
        name: 'rotateX',
        value: this._surface.rotate.x + 'deg'
      }
    ], immediately);
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
    this._surface.updateRotate();
    this._setTransformValues();
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

  public zoom(shift: number, time: number = this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, interimRounding: number = this._surface.CONFIG.SCALE_ROUNDING_INTERIM.VALUE) : false|{new: number, combined: number, time: number} {
    let initialShift = shift;
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Change shift value so that current scale + remaining + shift would equal step value
    shift = this._roundToStep(shift);
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
    // Preserve "new" shift to return it later
    let newShift = shift;
    // Add remaining shift to get "combined" one
    shift += this._remaining;
    // Calculate ratio of initial vs combined shift, clamped because we only want shorter animations
    let ratio = clampRatio(Math.abs(shift / initialShift));
    time = time * ratio;
    // Perform animation
    this._surface.animationStorage.create(Animations.SurfaceZoom, [shift, time, easingFormula]);
    this._surface.animationExecutor.initiate();
    // Indicate that there is change of scale
    return {
      new: newShift,
      combined: shift,
      time: time
    };
  }

  public zoomTo(value: number, time: number = this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc) : boolean {
    if (this._value === value) {
      return false;
    }
    return this.zoom(value - this._value, time, easingFormula, -1) !== false;
  }

  public step(steps: number) : boolean {
    let positive = steps > 0 ? true : false;
    return this._surface.scale.zoom(steps * this._surface.scale.stepSize(positive)) !== false;
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let positive = steps > 0 ? true : false;

    if ((positive && this._projection === this._surface.CONFIG.SCALE_MAX.VALUE) || (!positive && this._projection === this._surface.CONFIG.SCALE_MIN.VALUE)) {
      return;
    }

    let shiftPerStep = this.stepSize(positive);

    let initialShift = steps * shiftPerStep;
    let zoom = this.zoom(initialShift);

    // Vector is based on "new" shift because glide has it's own calculations vs remaining vector, but time is based on
    // "combined" shift because by default glide animation time is always the same.
    if (zoom !== false && mouse !== null) {
      let vector = this._surface.scale.glidePerStep(mouse, positive);

      let factor = Math.abs(zoom.new / initialShift);
      vector.x *= factor;
      vector.y *= factor;

      this._surface.position.glide(vector, zoom.time);
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

  private get _remaining() : number {
    if (this._surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return this._surface.animationStorage.surfaceZoom!.remaining;
    }
    return 0;
  }

  private _roundToStep(shift: number) : number {
    let projection = roundTo(
      clamp(this._surface.scale.value + this._remaining + shift, this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE),
      this._surface.scale.stepSize(shift > 0 ? true : false, this._surface.scale.value + shift)
    );

    return projection - this._surface.scale.value - this._remaining;
  }

  private get _projection() : number {
    return clamp(roundFloat(this._surface.scale.value + this._remaining, 4), this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE);
  }
}