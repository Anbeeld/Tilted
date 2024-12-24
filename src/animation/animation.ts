import Surface from '../index.js';

export default class Animation {
  protected surface: Surface; 

  protected timestampStart: number = 0;
  protected timestampLast: number = 0;

  public destroyed: boolean = false;

  constructor(surface: Surface) {
    this.surface = surface;
    this.timestampStart = this.timestampLast = performance.now();
  }

  public destroy() {
    this.destroyed = true;
  }
}