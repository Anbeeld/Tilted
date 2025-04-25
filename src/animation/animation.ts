import { Register } from '../register.js';
export default class Animation {
  private surfaceId: number;
  protected get surface() { return Register.surface(this.surfaceId)!; }

  protected timestampStart: number = 0;
  protected timestampLast: number = 0;

  public destroyed: boolean = false;

  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
    this.timestampStart = this.timestampLast = performance.now();
  }

  public destroy() {
    this.destroyed = true;
  }
}