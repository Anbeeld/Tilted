import Surface from '../index.js';
import Animation from './animation.js';

export default class AnimationSurfaceEdge extends Animation {
  private vector: {x: number, y: number};

  constructor(surface: Surface, vector: {x: number, y: number}) {
    super(surface);

    this.vector = vector;
  }

  public update(vector: {x: number, y: number}) : void {
    if (this.vector.x !== vector.x) {
      this.vector.x = vector.x;
    }
    if (this.vector.y !== vector.y) {
      this.vector.y = vector.y;
    }
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeFactor = Math.max(1, (timestampCurrent - this.timestampLast)) / 10;

    let x = this.surface.CONFIG.EDGE_MOVE_SPEED.VALUE * this.vector.x / this.surface.scale.value * timeFactor;
    let y = this.surface.CONFIG.EDGE_MOVE_SPEED.VALUE  * this.vector.y / this.surface.scale.value * timeFactor;

    this.timestampLast = timestampCurrent;
    
    return this.surface.move({x, y});
  }
}