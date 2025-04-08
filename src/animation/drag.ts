import { MouseParams } from '../controls/mouse.js';
import Animation from './animation.js';
import { EasingFunctions } from '../utils.js';
import { Register } from '../register.js';

export default class AnimationSurfaceDrag extends Animation {
  public id: number = Register.id();
  private _prev = {x: 0, y: 0};
  private _cumulated = {x: 0, y: 0};

  constructor (surfaceId: number, mouse: MouseParams) {
    super(surfaceId);

    this._surface.cancelOngoingMoves();

    this._prev = {
      x: mouse.x,
      y: mouse.y
    }
  }

  public step(mouse: MouseParams) : boolean {
    let wasMoved = this._surface.position.move({x: (this._prev.x - mouse.x) / this._surface.scale.value, y: (this._prev.y - mouse.y) / this._surface.scale.value});
    this._cumulated = {
      x: this._cumulated.x + this._prev.x - mouse.x,
      y: this._cumulated.y + this._prev.y - mouse.y
    }
    this._prev = {
      x: mouse.x,
      y: mouse.y
    };
    return wasMoved;
  }

  public override destroy() : void {
    if (performance.now() - this._timestampStart < this._surface.CONFIG.DURATION_FOR_TOSS.VALUE) {
      this._toss();
    }
    this.destroyed = true;
  }

  private _toss() : void {
    this._surface.position.glide(
      {
        x: this._cumulated.x * this._surface.CONFIG.TOSS_GLIDE_FACTOR.VALUE / this._surface.scale.value,
        y: this._cumulated.y * this._surface.CONFIG.TOSS_GLIDE_FACTOR.VALUE / this._surface.scale.value
      },
      this._surface.CONFIG.ANIMATION_TOSS_TIME.VALUE, EasingFunctions.EaseOutCirc
    );
  }
}