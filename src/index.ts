import Surface from './surface.js';
import { EntityProps } from './entity.js';

export default class Tilted {
  private surface: Surface;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: {} = {}, entity: EntityProps[] = []) {
    this.surface = new Surface(elementContainer, elementSurface, config, entity);
    this.surface;
  }
}