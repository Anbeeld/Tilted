import { roundFloat, clamp, EasingFunctions, Coords } from './utils.js';
import { Animations } from './animation/storage.js';
import { getSurface } from './register.js';

export default class Position {
  private _surfaceId: number;
  private get _surface() { return getSurface(this._surfaceId); }

  private _coords = {x: 0, y: 0};
  public get coords() : Coords {
    return {x: this._coords.x, y: this._coords.y};
  }

  constructor(surfaceId: number) {
    this._surfaceId = surfaceId;
  }

  private get _limit() : Coords {
    return {
      x: Math.round(this._surface.surfaceWidth / 2 - this._surface.containerWidth * 0.25),
      y: Math.round(this._surface.surfaceHeight / 2 - this._surface.containerHeight * 0.25)
    };
  }
  public get limit() : Coords {
    return this._limit;
  }

  public get min() : Coords {
    return {
      x: this._limit.x * -1,
      y: this._limit.y * -1
    };
  }
  public get max() : Coords {
    return {
      x: this._limit.x,
      y: this._limit.y
    };
  }

  public move(vector: Coords, interimRounding: number = this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
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
        x: roundFloat(this._coords.x + vector.x, finalRounding),
        y: roundFloat(this._coords.y + vector.y, finalRounding)
      };
    } else {
      result = {
        x: this._coords.x + vector.x,
        y: this._coords.y + vector.y
      };
    }
    result = {
      x: clamp(result.x, this.min.x, this.max.x),
      y: clamp(result.y, this.min.y, this.max.y)
    };
    // Check if coords will change
    if (result.x === this._coords.x && result.y === this._coords.y) {
      return false;
    }
    // Change surface coords to new ones
    this._coords = result;
    this._surface.setTransformValues([{
      name: 'translate3d',
      value: (this._coords.x * -1) + 'px, ' + (this._coords.y * -1) + 'px, 0'
    }]);
    // Indicate that there is change of coords
    return true;
  }

  public moveTo(coords: Coords, finalRounding: number = this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      coords = {
        x: roundFloat(coords.x, finalRounding),
        y: roundFloat(coords.y, finalRounding)
      }
    }
    if (this._coords.x === coords.x && this._coords.y === coords.y) {
      return false;
    }
    // this._surface.CONFIG.DEBUG_MODE.VALUE && this._surface.log([
    //   {desc: 'moveTo coords.x', from: this._coords.x, to: coords.x},
    //   {desc: 'moveTo coords.y', from: this._coords.y, to: coords.y}
    // ]);
    return this.move({x: coords.x - this._coords.x, y: coords.y - this._coords.y}, -1, finalRounding);
  }

  public glide(vector: Coords, time: number = this._surface.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, interimRounding: number = this._surface.CONFIG.COORD_ROUNDING_INTERIM.VALUE, finalRounding: number = this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
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
        x: roundFloat(this._coords.x + vector.x, finalRounding),
        y: roundFloat(this._coords.y + vector.y, finalRounding)
      }
    } else {
      result = {
        x: this._coords.x + vector.x,
        y: this._coords.y + vector.y
      }
    }
    // Set vector = result - current, enforsing limits and final rounding
    vector = {
      x: clamp(result.x, this.min.x, this.max.x) - this._coords.x,
      y: clamp(result.y, this.min.y, this.max.y) - this._coords.y
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
    this._surface.CONFIG.DEBUG_MODE.VALUE && this._surface.log([
      {desc: 'glide coords.x', to: vector.x},
      {desc: 'glide coords.y', to: vector.y}
    ]);
    // Add remaining vector of current animation as it will get overwritten
    vector = {
      x: roundFloat(vector.x + this._remaining.x, interimRounding),
      y: roundFloat(vector.y + this._remaining.y, interimRounding)
    }
    // Perform animation
    this._surface.animationStorage.create(Animations.SurfaceGlide, [{x: vector.x, y: vector.y}, time, easingFormula]);
    this._surface.animationExecutor.initiate();
    // Indicate that there is change of coords
    return true;
  }

  public glideTo(coords: Coords, time: number = this._surface.CONFIG.ANIMATION_GLIDE_TIME.VALUE, easingFormula: EasingFunctions = EasingFunctions.EaseOutCirc, finalRounding: number = this._surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) : boolean {
    if (finalRounding >= 0) {
      coords = {
        x: roundFloat(coords.x, finalRounding),
        y: roundFloat(coords.y, finalRounding)
      }
    }
    if (this._coords.x === coords.x && this._coords.y === coords.y) {
      return false;
    }
    // this._surface.CONFIG.DEBUG_MODE.VALUE && this._surface.log([
    //   {desc: 'glideTo coords.x', from: this._coords.x, to: coords.x},
    //   {desc: 'glideTo coords.y', from: this._coords.y, to: coords.y}
    // ]);
    return this.glide({x: coords.x - this._coords.x, y: coords.y - this._coords.y}, time, easingFormula, -1, finalRounding);
  }

  public enforceLimits() : void {
    this.moveTo({x: clamp(this._coords.x, this.min.x, this.max.x), y: clamp(this._coords.y, this.min.y, this.max.y)});
  }

  private get _remaining() : Coords {
    if (this._surface.animationStorage.exists(Animations.SurfaceGlide)) {
      return this._surface.animationStorage.surfaceGlide!.remaining;
    }
    return {x: 0, y: 0};
  }
}