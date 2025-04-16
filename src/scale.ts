import { clamp, clampRatio, EasingFunctions, roundFloat, Coords, calculateSteps, findClosestInArray, calculateShiftsToStep } from './utils.js';
import { MouseParams } from './controls/mouse.js';
import { Animations } from './animation/storage.js';
import { Register } from './register.js';

export default class Scale {
  private _surfaceId: number;
  private get _surface() { return Register.surface(this._surfaceId)!; }
  private _steps: number[] = [];
  private _shiftsToStep: {up: number, down: number}[] = [];
  public _value: number;

  constructor(surfaceId: number) {
    this._surfaceId = surfaceId;
    this._steps = calculateSteps(this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE, this._surface.CONFIG.SCALE_NUM_STEPS.VALUE, this._surface.CONFIG.SCALE_ROUNDING.VALUE);
    this._shiftsToStep = calculateShiftsToStep(this._steps, this._surface.CONFIG.SCALE_ROUNDING.VALUE);
    this._value = this._steps[this._surface.CONFIG.SCALE_DEFAULT_STEP.VALUE - 1]!;

    this._surface.updateRotate(this._value);
    this._setTransformValues(true);
  }

  public get value() : number {
    return this._value;
  }

  private get _ongoing() : number {
    if (this._surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return this._surface.animationStorage.surfaceZoom!.remaining;
    }
    return 0;
  }

  private get _projection() : number {
    return clamp(roundFloat(this._surface.scale.value + this._ongoing, this._surface.CONFIG.SCALE_ROUNDING.VALUE), this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE);
  }
  
  private _stepNumByValue(value?: number): number {
    return this._steps.indexOf(findClosestInArray(this._steps, value ?? this._value));
  }

  private _shiftToStep(positive: boolean, value?: number) : number {
    if (value === undefined) {
      value = this._projection;
    }
    return positive ? this._shiftsToStep[this._stepNumByValue(value)]!.up : this._shiftsToStep[this._stepNumByValue(value)]!.down;
  }

  private _roundToStep(shift: number) : number {
    let projection = findClosestInArray(
      this._steps,
      clamp(this._surface.scale.value + this._ongoing + shift, this._surface.CONFIG.SCALE_MIN.VALUE, this._surface.CONFIG.SCALE_MAX.VALUE),
    );
    return projection - this._surface.scale.value - this._ongoing;
  }

  private _setTransformValues(immediately: boolean = false) : void {
    this._surface.setTransformValues([
      {
        name: 'scale',
        value: this._value.toString()
      },
      {
        name: 'rotateX',
        value: this._surface.rotate.x + 'deg'
      }
    ], immediately);
  }

  public change(shift: number, rounding: number = this._surface.CONFIG.SCALE_ROUNDING.VALUE) : boolean {
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Round shift
    if (rounding >= 0) {
      shift = roundFloat(shift, rounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Calculate scale result with limits and final rounding
    let result;
    if (rounding >= 0) {
      result = roundFloat(this._value + shift, rounding);
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

  public changeTo(value: number, rounding: number = this._surface.CONFIG.SCALE_ROUNDING.VALUE) : boolean {
    if (rounding >= 0) {
      value = roundFloat(value, rounding);
    }
    if (this._value === value) {
      return false;
    }
    return this.change(value - this._value, rounding);
  }

  public zoom(shift: number, time: number = this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, rounding: number = this._surface.CONFIG.SCALE_ROUNDING.VALUE) : false|{new: number, combined: number, time: number} {
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
    if (rounding >= 0) {
      shift = roundFloat(shift, rounding);
    }
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Preserve "new" shift to return it later
    let newShift = shift;
    // Add remaining shift to get "combined" one
    shift += this._ongoing;
    // Calculate ratio of initial vs combined shift, clamped because we only want shorter animations
    let ratio = clampRatio(Math.abs(shift / initialShift));
    time = time * ratio;
    // Perform animation
    this._surface.animationStorage.create(Animations.SurfaceZoom, [shift, time, easingFormula]);
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
    return this._surface.scale.zoom(steps * this._surface.scale._shiftToStep(positive)) !== false;
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let positive = steps > 0 ? true : false;

    if ((positive && this._projection === this._surface.CONFIG.SCALE_MAX.VALUE) || (!positive && this._projection === this._surface.CONFIG.SCALE_MIN.VALUE)) {
      return;
    }

    let shiftPerStep = this._shiftToStep(positive);

    let initialProjection = this._projection;
    let initialShift = steps * shiftPerStep;
    let zoom = this.zoom(initialShift, this._surface.CONFIG.ANIMATION_SCALE_TIME.VALUE);

    // Vector is based on "new" shift because glide has it's own calculations vs remaining vector, but time is based on
    // "combined" shift because glide animation time is always the same by default.
    if (zoom !== false && mouse !== null && !this._surface.animationStorage.exists(Animations.SurfaceEdge)) {
      let vector = this.glideToMouse(mouse, initialProjection, zoom.new);

      let factor = Math.abs(zoom.new / initialShift);
      vector.x *= factor;
      vector.y *= factor;

      this._surface.position.glide(vector, zoom.time);

      if (this._surface.animationStorage.exists(Animations.SurfaceZoom)
          && this._surface.animationStorage.exists(Animations.SurfaceGlide)) {
        this._surface.animationStorage.surfaceGlide!.tieWithZoomAnimation(this._surface.animationStorage.surfaceZoom!);
      }
    }
  }

  private getDisplayedSurface(scale?: number, position?: Coords) {
    if (!scale) {
      scale = this._surface.scale.value;
    }

    if (!position) {
      position = this._surface.position.coords;
    }

    return {
      top: {
        left: {
          x: position.x - this._surface.containerWidth / 2 / scale,
          y: position.y + this._surface.containerHeight / 2 / scale
        },
        right: {
          x: position.x + this._surface.containerWidth / 2 / scale,
          y: position.y + this._surface.containerHeight / 2 / scale
        }
      },
      bottom: {
        left: {
          x: position.x - this._surface.containerWidth / 2 / scale,
          y: position.y - this._surface.containerHeight / 2 / scale
        },
        right: {
          x: position.x + this._surface.containerWidth / 2 / scale,
          y: position.y - this._surface.containerHeight / 2 / scale
        }
      }
    };
  }

  private glideToMouse(mouse: MouseParams, initialScale: number, zoomScale: number) {
    let displayedSurfaceInitial = this.getDisplayedSurface(initialScale);
    let pointedSurfaceInitial = {
      x: displayedSurfaceInitial.top.left.x + mouse.x / initialScale,
      y: displayedSurfaceInitial.top.left.y - mouse.y / initialScale
    };

    let newScale = initialScale + zoomScale;

    let displayedSurfaceZoomed = this.getDisplayedSurface(newScale);
    let pointedSurfaceZoomed = {
      x: displayedSurfaceZoomed.top.left.x + mouse.x / newScale,
      y: displayedSurfaceZoomed.top.left.y - mouse.y / newScale
    };

    return {
      x: (pointedSurfaceInitial.x - pointedSurfaceZoomed.x),
      y: (pointedSurfaceZoomed.y - pointedSurfaceInitial.y)
    }
  }
}