import { MouseParams } from '../controls/mouse.js';
import Animation from './animation.js';
import { EasingFunctions } from '../utils.js';
import { Register } from '../register.js';

export default class AnimationSurfaceDrag extends Animation {
  public id: number = Register.id();
  private prev = {x: 0, y: 0};
  private cumulated = {x: 0, y: 0};

  constructor (surfaceId: number, mouse: MouseParams) {
    super(surfaceId);

    this.surface.cancelOngoingMoves();

    this.prev = {
      x: mouse.x,
      y: mouse.y
    }
  }

  public step(mouse: MouseParams) : boolean {
    let wasMoved = this.surface.position.move({x: (this.prev.x - mouse.x) / this.surface.scale.value, y: (this.prev.y - mouse.y) / this.surface.scale.value});
    this.cumulated = {
      x: this.cumulated.x + this.prev.x - mouse.x,
      y: this.cumulated.y + this.prev.y - mouse.y
    }
    this.prev = {
      x: mouse.x,
      y: mouse.y
    };
    return wasMoved;
  }

  public override destroy() : void {
    if (performance.now() - this.timestampStart < this.surface.CONFIG.DURATION_FOR_TOSS.VALUE) {
      this.toss();
    }
    this.destroyed = true;
  }

  private toss() : void {
    this.surface.position.glide(
      {
        x: this.cumulated.x * this.surface.CONFIG.TOSS_GLIDE_FACTOR.VALUE / this.surface.scale.value,
        y: this.cumulated.y * this.surface.CONFIG.TOSS_GLIDE_FACTOR.VALUE / this.surface.scale.value
      },
      this.surface.CONFIG.ANIMATION_TOSS_TIME.VALUE, EasingFunctions.EaseOutCirc
    );
  }
}