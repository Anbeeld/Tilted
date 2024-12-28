import Surface from './index.js';
import { roundFloat } from './utils.js';
import { MouseParams } from './controls/mouse.js';

export default class Scale {
  protected surface: Surface;
  public _value: number;

  constructor(surface: Surface, value: number) {
    this.surface = surface;
    this._value = value;

    this.surface.updateSkew(this._value);
    this.surface.elements.scale.classList.add('tilted-notransition-' + this.surface.id);
    this.surface.elements.scale.style.transform = 'scale(' + this._value + ') perspective(' + this.surface.CONFIG.PERSPECTIVE_DISTANCE.VALUE + 'px) rotate3d(1, 0, 0, ' + this.surface.skew.x + 'deg)';
    this.surface.elements.scale.offsetHeight;
    this.surface.elements.scale.classList.remove('tilted-notransition-' + this.surface.id);
  }

  public get value() : number {
    return this._value;
  }

  private change(change: number) : boolean {
    if (change === 0) {
      return false;
    }

    let oldScale = this._value;

    this._value = roundFloat(this._value + change, this.surface.CONFIG.SCALE_ROUNDING.VALUE);
    this._value = Math.max(this._value, this.surface.CONFIG.SCALE_MIN.VALUE);
    this._value = Math.min(this._value, this.surface.CONFIG.SCALE_MAX.VALUE);

    if (oldScale === this._value) {
      return false;
    }

    this.surface.updateSkew();

    this.surface.elements.scale.style.transform = 'scale(' + this._value + ') perspective(' + this.surface.CONFIG.PERSPECTIVE_DISTANCE.VALUE + 'px) rotate3d(1, 0, 0, ' + this.surface.skew.x + 'deg)';

    this.surface.CONFIG.DEBUG_MODE.VALUE && this.surface.log([
      {desc: 'scale', from: oldScale, to: this._value}
    ]);

    return true;
  }

  public step(steps: number) : boolean {
    let positive = steps > 0 ? true : false;
    return this.surface.scale.change(steps * this.surface.scale.stepSize(positive));
  }
  
  public stepAndGlide(steps: number, mouse: MouseParams|null = null) : void {
    let scaleChanged = this.surface.scale.step(steps);
    if (scaleChanged && mouse !== null) {
      let positive = steps > 0 ? true : false;
      let glide = this.surface.scale.glidePerStep(mouse, positive);
      this.surface.glide({x: glide.x, y: glide.y});
    }
  }

  public stepSize(positive: boolean) : number {
    if ((positive && this._value < this.surface.CONFIG.SCALE_DEFAULT.VALUE) || (!positive && this._value <= this.surface.CONFIG.SCALE_DEFAULT.VALUE)) {
      return (this.surface.CONFIG.SCALE_DEFAULT.VALUE - this.surface.CONFIG.SCALE_MIN.VALUE) * this.surface.CONFIG.SCALE_STEP.VALUE;
    } else {
      return (this.surface.CONFIG.SCALE_MAX.VALUE - this.surface.CONFIG.SCALE_DEFAULT.VALUE) * this.surface.CONFIG.SCALE_STEP.VALUE;
    }
  }

  public glidePerStep(mouse: MouseParams, positive: boolean) : {x: number, y: number} {
    let positiveMultiplier = positive ? 1 : -1;
    return {
      x: roundFloat((mouse.x - this.surface.containerWidth / 2) * this.surface.CONFIG.SCALE_GLIDE.VALUE / this._value, this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) * positiveMultiplier,
      y: roundFloat((mouse.y - this.surface.containerHeight / 2) * this.surface.CONFIG.SCALE_GLIDE.VALUE / this._value, this.surface.CONFIG.COORD_ROUNDING_FINAL.VALUE) * positiveMultiplier
    }
  }
}