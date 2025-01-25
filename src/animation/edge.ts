import { Coords } from '../utils.js';
import Animation from './animation.js';

export default class AnimationSurfaceEdge extends Animation {
  private _vector: Coords;

  constructor(surfaceId: number, vector: Coords) {
    super(surfaceId);

    this._vector = vector;
  }

  public update(vector: Coords) : void {
    if (this._vector.x !== vector.x) {
      this._vector.x = vector.x;
    }
    if (this._vector.y !== vector.y) {
      this._vector.y = vector.y;
    }
  }

  public step(timestampCurrent: number) : boolean {
    if (this.destroyed) {
      return false;
    }

    let timeFactor = Math.max(1, (timestampCurrent - this._timestampLast)) / 10;

    let x = this._surface.CONFIG.EDGE_MOVE_SPEED.VALUE * this._vector.x / this._surface.scale.value * timeFactor;
    let y = this._surface.CONFIG.EDGE_MOVE_SPEED.VALUE  * this._vector.y / this._surface.scale.value * timeFactor;

    this._timestampLast = timestampCurrent;
    
    return this._surface.position.move({x, y});
  }
}