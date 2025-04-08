import { Register } from '../register.js';
export default class Animation {
  private _surfaceId: number;
  protected get _surface() { return Register.surface(this._surfaceId)!; }

  protected _timestampStart: number = 0;
  protected _timestampLast: number = 0;

  public destroyed: boolean = false;

  constructor(surfaceId: number) {
    this._surfaceId = surfaceId;
    this._timestampStart = this._timestampLast = performance.now();
  }

  public destroy() {
    this.destroyed = true;
  }
}