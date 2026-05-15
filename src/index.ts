import Surface from './surface.js';
import { ContentProps } from './content.js';
import { CustomConfig } from './config.js';

export type { ContentProps } from './content.js';
export { ContentType } from './content.js';
export type { CustomConfig } from './config.js';

export default class Tilted {
  private surface: Surface;

  public constructor(elementContainer: HTMLElement, elementSurface: HTMLElement, config: CustomConfig = {}, content: ContentProps[] = []) {
    this.surface = new Surface(elementContainer, elementSurface, config, content);
  }

  public addContent(content: ContentProps) {
    this.surface.addContent(content);
  }

  public deleteContent(element: HTMLElement) {
    this.surface.deleteContent(element);
  }

  public clearContents() {
    this.surface.clearContents();
  }

  public destroy() {
    this.surface.destroy();
  }
}
