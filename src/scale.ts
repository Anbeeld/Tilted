import { clamp, clampRatio, EasingFunctions, roundFloat, Coords, calculateSteps, findClosestInArray, calculateShiftsToStep } from './utils.js';
import { MouseParams } from './controls/mouse.js';
import { Animations } from './animation/storage.js';
import { Register } from './register.js';

export default class Scale {
  private surfaceId: number;
  private get surface() { return Register.surface(this.surfaceId)!; }
  private steps: number[] = [];
  private shiftsToStep: {up: number, down: number}[] = [];

  // @ts-ignore Doesn't understand setters and getters
  private _value: number;
  private set value(value: number) { this._value = value; }
  public get value() { return this._value; }

  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
    this.steps = calculateSteps(this.surface.CONFIG.SCALE_MIN.VALUE, this.surface.CONFIG.SCALE_MAX.VALUE, this.surface.CONFIG.SCALE_NUM_STEPS.VALUE, this.surface.CONFIG.SCALE_ROUNDING.VALUE);
    this.shiftsToStep = calculateShiftsToStep(this.steps, this.surface.CONFIG.SCALE_ROUNDING.VALUE);
    this.value = this.steps[this.surface.CONFIG.SCALE_DEFAULT_STEP.VALUE - 1]!;

    this.surface.updateRotate(this.value);
    this.setTransformValues(true);
  }

  private get ongoing() : number {
    if (this.surface.animationStorage.exists(Animations.SurfaceZoom)) {
      return this.surface.animationStorage.surfaceZoom!.remaining;
    }
    return 0;
  }

  private get projection() : number {
    return clamp(roundFloat(this.surface.scale.value + this.ongoing, this.surface.CONFIG.SCALE_ROUNDING.VALUE), this.surface.CONFIG.SCALE_MIN.VALUE, this.surface.CONFIG.SCALE_MAX.VALUE);
  }
  
  private stepNumByValue(value?: number): number {
    return this.steps.indexOf(findClosestInArray(this.steps, value ?? this.value));
  }

  private shiftToStep(positive: boolean, value?: number) : number {
    if (value === undefined) {
      value = this.projection;
    }
    return positive ? this.shiftsToStep[this.stepNumByValue(value)]!.up : this.shiftsToStep[this.stepNumByValue(value)]!.down;
  }

  private roundToStep(shift: number) : number {
    let projection = findClosestInArray(
      this.steps,
      clamp(this.surface.scale.value + this.ongoing + shift, this.surface.CONFIG.SCALE_MIN.VALUE, this.surface.CONFIG.SCALE_MAX.VALUE),
    );
    return projection - this.surface.scale.value - this.ongoing;
  }

  private setTransformValues(immediately: boolean = false) : void {
    this.surface.setTransformValues([
      {
        name: 'scale',
        value: this.value.toString()
      },
      {
        name: 'rotateX',
        value: this.surface.rotate.x + 'deg'
      }
    ], immediately);
  }

  public change(shift: number, rounding: number = this.surface.CONFIG.SCALE_ROUNDING.VALUE) : boolean {
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
      result = roundFloat(this.value + shift, rounding);
    } else {
      result = this.value + shift;
    }
    result = clamp(result, this.surface.CONFIG.SCALE_MIN.VALUE, this.surface.CONFIG.SCALE_MAX.VALUE)
    // Check if scale will change
    if (result === this.value) {
      return false;
    }
    // Set surface scale to a new value
    this.value = result;
    this.surface.updateRotate();
    this.setTransformValues();
    // Indicate that there was a change of scale
    return true;
  }

  public changeTo(value: number, rounding: number = this.surface.CONFIG.SCALE_ROUNDING.VALUE) : boolean {
    if (rounding >= 0) {
      value = roundFloat(value, rounding);
    }
    if (this.value === value) {
      return false;
    }
    return this.change(value - this.value, rounding);
  }

  public zoom(shift: number, time: number = this.surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, rounding: number = this.surface.CONFIG.SCALE_ROUNDING.VALUE) : false|{new: number, combined: number, time: number} {
    let initialShift = shift;
    // Check if shift is zero
    if (shift === 0) {
      return false;
    }
    // Change shift value so that current scale + remaining + shift would equal step value
    shift = this.roundToStep(shift);
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
    shift += this.ongoing;
    // Calculate ratio of initial vs combined shift, clamped because we only want shorter animations
    let ratio = clampRatio(Math.abs(shift / initialShift));
    time = time * ratio;
    // Perform animation
    this.surface.animationStorage.create(Animations.SurfaceZoom, [shift, time, easingFormula]);
    // Indicate that there is change of scale
    return {
      new: newShift,
      combined: shift,
      time: time
    };
  }

  public zoomTo(value: number, time: number = this.surface.CONFIG.ANIMATION_SCALE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc) : boolean {
    if (this.value === value) {
      return false;
    }
    return this.zoom(value - this.value, time, easingFormula, -1) !== false;
  }

  public step(steps: number) : boolean {
    let positive = steps > 0 ? true : false;
    return this.surface.scale.zoom(steps * this.surface.scale.shiftToStep(positive)) !== false;
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let positive = steps > 0 ? true : false;

    if ((positive && this.projection === this.surface.CONFIG.SCALE_MAX.VALUE) || (!positive && this.projection === this.surface.CONFIG.SCALE_MIN.VALUE)) {
      return;
    }

    let shiftPerStep = this.shiftToStep(positive);

    let initialProjection = this.projection;
    let initialShift = steps * shiftPerStep;
    let zoom = this.zoom(initialShift, this.surface.CONFIG.ANIMATION_SCALE_TIME.VALUE);

    // Vector is based on "new" shift because glide has it's own calculations vs remaining vector, but time is based on
    // "combined" shift because glide animation time is always the same by default.
    if (zoom !== false && mouse !== null && !this.surface.animationStorage.exists(Animations.SurfaceEdge)) {
      let vector = this.glideToMouse(mouse, initialProjection, zoom.new);

      let factor = Math.abs(zoom.new / initialShift);
      vector.x *= factor;
      vector.y *= factor;

      this.surface.position.glide(vector, zoom.time);

      if (this.surface.animationStorage.exists(Animations.SurfaceZoom)
          && this.surface.animationStorage.exists(Animations.SurfaceGlide)) {
        this.surface.animationStorage.surfaceGlide!.tieWithZoomAnimation(this.surface.animationStorage.surfaceZoom!);
      }
    }
  }

  private getDisplayedSurface(scale?: number, position?: Coords) {
    if (!scale) {
      scale = this.surface.scale.value;
    }

    if (!position) {
      position = this.surface.position.coords;
    }

    return {
      top: {
        left: {
          x: position.x - this.surface.containerWidth / 2 / scale,
          y: position.y + this.surface.containerHeight / 2 / scale
        },
        right: {
          x: position.x + this.surface.containerWidth / 2 / scale,
          y: position.y + this.surface.containerHeight / 2 / scale
        }
      },
      bottom: {
        left: {
          x: position.x - this.surface.containerWidth / 2 / scale,
          y: position.y - this.surface.containerHeight / 2 / scale
        },
        right: {
          x: position.x + this.surface.containerWidth / 2 / scale,
          y: position.y - this.surface.containerHeight / 2 / scale
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