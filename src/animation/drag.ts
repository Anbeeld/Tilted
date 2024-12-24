import { v4 as uuidv4 } from 'uuid';

import Surface from '../index.js';
import { MouseParams, getMouseParams } from '../controls/mouse.js';
import Animation from './animation.js';

export default class AnimationSurfaceDrag extends Animation {
  public id: string;
  private prev = {x: 0, y: 0};
  private cumulated = {x: 0, y: 0};

  constructor (surface: Surface, mouse: MouseParams) {
    super(surface);

    this.surface.cancelOngoingMoves();

    this.id = uuidv4();
    this.prev = {
      x: mouse.x,
      y: mouse.y
    }
  }

  public step(mouse: MouseParams) : boolean {
    // this.timestampLast = performance.now();
    let wasMoved = this.surface.move({x: (this.prev.x - mouse.x) / this.surface.scale.value, y: (this.prev.y - mouse.y) / this.surface.scale.value});
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

  public destroy() : void {
    if (performance.now() - this.timestampStart < this.surface.CONFIG.DURATION_FOR_THROW.VALUE) {
      this.throw();
    }
    this.destroyed = true;
  }

  private throw() : void {
    this.surface.glide(
      {
        x: this.cumulated.x * this.surface.CONFIG.THROW_MULTIPLIER.VALUE,
        y: this.cumulated.y * this.surface.CONFIG.THROW_MULTIPLIER.VALUE
      },
      this.surface.CONFIG.ANIMATION_THROW_TIME.VALUE, [0, 0.55, 0.45, 1]
    );
  }
}