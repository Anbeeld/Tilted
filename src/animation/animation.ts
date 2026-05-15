import { Registry } from '../registry.js';
export default class Animation {
  private surfaceId: number;
  protected get surface() { return Registry.surfaceRequired(this.surfaceId); }

  protected timestampStart: number = -1;
  protected timestampLast: number = -1;

  protected destroyed: boolean = false;
  public get isDestroyed() { return this.destroyed; }

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