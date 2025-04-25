import { Coords } from '../utils.js';
import Animation from './animation.js';

export default class AnimationSurfaceEdge extends Animation {
  private vector: Coords;

  constructor(surfaceId: number, vector: Coords) {
    super(surfaceId);

    this.vector = vector;
  }

  public update(vector: Coords) : void {
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
    
    return this.surface.position.move({x, y});
  }
}