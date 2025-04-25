import { roundFloat, clamp, EasingFunctions, Coords } from './utils.js';
import { Animations } from './animation/storage.js';
import { Register } from './register.js';

export default class Position {
  private surfaceId: number;
  private get surface() { return Register.surface(this.surfaceId)!; }

  // @ts-ignore Doesn't understand setters and getters
  private _coords: Coords = {x: 0, y: 0};
  private set coords(coords: Coords) { this._coords = coords; }
  public get coords() : Coords { return this._coords; }

  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
  }

  public get limit() : Coords {
    return {
      x: Math.round(this.surface.surfaceWidth / 2 - this.surface.containerWidth * 0.25),
      y: Math.round(this.surface.surfaceHeight / 2 - this.surface.containerHeight * 0.25)
    };
  }

  public get min() : Coords {
    return {
      x: this.limit.x * -1,
      y: this.limit.y * -1
    };
  }
  public get max() : Coords {
    return {
      x: this.limit.x,
      y: this.limit.y
    };
  }

  private get ongoing() : Coords {
    if (this.surface.animationStorage.exists(Animations.SurfaceGlide)) {
      return this.surface.animationStorage.surfaceGlide!.remaining;
    }
    return {x: 0, y: 0};
  }

  public move(vector: Coords, interimRounding: number = this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Round vector
    if (interimRounding >= 0) {
      vector.x = roundFloat(vector.x, interimRounding);
      vector.y = roundFloat(vector.y, interimRounding);
    }
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Calculate move result with limits and final rounding
    let result;
    if (finalRounding >= 0) {
      result = {
        x: roundFloat(this.coords.x + vector.x, finalRounding),
        y: roundFloat(this.coords.y + vector.y, finalRounding)
      };
    } else {
      result = {
        x: this.coords.x + vector.x,
        y: this.coords.y + vector.y
      };
    }
    result = {
      x: clamp(result.x, this.min.x, this.max.x),
      y: clamp(result.y, this.min.y, this.max.y)
    };
    // Check if coords will change
    if (result.x === this.coords.x && result.y === this.coords.y) {
      return false;
    }
    // Change surface coords to new ones
    this.coords = result;
    this.surface.setTransformValues([{
      name: 'translate3d',
      value: (this.coords.x * -1) + 'px, ' + (this.coords.y * -1) + 'px, 0'
    }]);
    // Indicate that there is change of coords
    return true;
  }

  public moveTo(coords: Coords, finalRounding: number = this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      coords = {
        x: roundFloat(coords.x, finalRounding),
        y: roundFloat(coords.y, finalRounding)
      }
    }
    if (this.coords.x === coords.x && this.coords.y === coords.y) {
      return false;
    }
    false && this.surface.log([
      {desc: 'moveTo coords.x', from: this.coords.x, to: coords.x},
      {desc: 'moveTo coords.y', from: this.coords.y, to: coords.y}
    ]);
    return this.move({x: coords.x - this.coords.x, y: coords.y - this.coords.y}, -1, finalRounding);
  }

  public glide(vector: Coords, time: number = this.surface.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, interimRounding: number = this.surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Round vector
    if (interimRounding >= 0) {
      vector = {
        x: roundFloat(vector.x, interimRounding),
        y: roundFloat(vector.y, interimRounding)
      }
    }
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Calculate glide result with final rounding
    let result;
    if (finalRounding >= 0) {
      result = {
        x: roundFloat(this.coords.x + vector.x, finalRounding),
        y: roundFloat(this.coords.y + vector.y, finalRounding)
      }
    } else {
      result = {
        x: this.coords.x + vector.x,
        y: this.coords.y + vector.y
      }
    }
    // Set vector = result - current, enforsing limits and final rounding
    vector = {
      x: clamp(result.x, this.min.x, this.max.x) - this.coords.x,
      y: clamp(result.y, this.min.y, this.max.y) - this.coords.y
    }
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Round vector
    if (interimRounding >= 0) {
      vector = {
        x: roundFloat(vector.x, interimRounding),
        y: roundFloat(vector.y, interimRounding)
      }
    }
    // Check if vector is zero
    if (vector.x === 0 && vector.y === 0) {
      return false;
    }
    // Log
    false && this.surface.log([
      {desc: 'glide coords.x', to: vector.x},
      {desc: 'glide coords.y', to: vector.y}
    ]);
    // Add remaining vector of current animation as it will get overwritten
    vector = {
      x: roundFloat(vector.x + this.ongoing.x, interimRounding),
      y: roundFloat(vector.y + this.ongoing.y, interimRounding)
    }
    // Perform animation
    this.surface.animationStorage.create(Animations.SurfaceGlide, [{x: vector.x, y: vector.y}, time, easingFormula]);
    // Indicate that there is change of coords
    return true;
  }

  public glideTo(coords: Coords, time: number = this.surface.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, finalRounding: number = this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      coords = {
        x: roundFloat(coords.x, finalRounding),
        y: roundFloat(coords.y, finalRounding)
      }
    }
    if (this.coords.x === coords.x && this.coords.y === coords.y) {
      return false;
    }
    false && this.surface.log([
      {desc: 'glideTo coords.x', from: this.coords.x, to: coords.x},
      {desc: 'glideTo coords.y', from: this.coords.y, to: coords.y}
    ]);
    return this.glide({x: coords.x - this.coords.x, y: coords.y - this.coords.y}, time, easingFormula, -1, finalRounding);
  }

  public enforceLimits() : void {
    this.moveTo({x: clamp(this.coords.x, this.min.x, this.max.x), y: clamp(this.coords.y, this.min.y, this.max.y)});
  }
}