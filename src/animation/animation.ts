import { Register } from '../register.js';
export default class Animation {
  private surfaceId: number;
  protected get surface() { return Register.surface(this.surfaceId)!; }

  protected timestampStart: number = -1;
  protected timestampLast: number = -1;

  protected destroyed: boolean = false;

  constructor(surfaceId: number) {
    this.surfaceId = surfaceId;
  }

  protected initTimestamps(timestampCurrent?: number) {
    if (this.timestampStart < 0 || this.timestampLast < 0) {
      if (!timestampCurrent) {
        timestampCurrent = performance.now();
      }
      this.timestampStart = timestampCurrent;
      this.timestampLast = timestampCurrent;
    }
  }

  public destroy() {
    this.destroyed = true;
  }
}