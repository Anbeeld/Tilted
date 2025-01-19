import Surface from '../index.js';

export default class Animation {
  protected _surface: Surface; 

  protected _timestampStart: number = 0;
  protected _timestampLast: number = 0;

  public destroyed: boolean = false;

  constructor(surface: Surface) {
    this._surface = surface;
    this._timestampStart = this._timestampLast = performance.now();
  }

  public destroy() {
    this.destroyed = true;
  }
}