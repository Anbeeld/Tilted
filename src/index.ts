import Surface from './surface.js';
import { ContentProps } from './content.js';

export default class Tilted {
  private surface: Surface;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: {} = {}, content: ContentProps[] = []) {
    this.surface = new Surface(elementContainer, elementSurface, config, content);
    this.surface;
  }
}