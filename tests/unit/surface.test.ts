import { afterEach, describe, expect, test, vi } from 'vitest'
import Tilted, { CustomConfig } from '../../src/index.js'
import Surface from '../../src/surface.js'
import { Registry } from '../../src/registry.js'
import { createElements } from './setup.js'

describe('Surface', () => {
  let createdSurfaces: Surface[] = [];

  function createSurface(config: CustomConfig = {}, containerSize = { width: 3200, height: 1800 }, surfaceSize = { width: 1600, height: 900 }) {
    const { containerElement, surfaceElement } = createElements(containerSize, surfaceSize);
    const surface = new Surface(containerElement, surfaceElement, config, []);
    createdSurfaces.push(surface);
    return { surface, containerElement, surfaceElement };
  }

  afterEach(() => {
    for (let surface of createdSurfaces) {
      surface.destroy();
    }
    createdSurfaces = [];
    document.body.innerHTML = '';
    document.head.innerHTML = '';
  });

  test('Checks width and height of container element', () => {
    const { surface } = createSurface();
    expect(surface.containerWidth).toBe(3200);
    expect(surface.containerHeight).toBe(1800);
  });

  test('Checks width and height of surface element', () => {
    const { surface } = createSurface();
    expect(surface.surfaceWidth).toBe(1600);
    expect(surface.surfaceHeight).toBe(900);
  });

  test('Continues dragging when pointer leaves container', () => {
    const { surface, containerElement } = createSurface({}, { width: 1000, height: 1000 }, { width: 1000, height: 1000 });

    containerElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100, button: 0 }));
    document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 50, clientY: 50, button: 0 }));

    expect(surface.position.coords.x).toBe(100);
    expect(surface.position.coords.y).toBe(100);
  });

  test('Destroy removes global side effects and unregisters the surface', () => {
    const { surface, containerElement, surfaceElement } = createSurface();
    const styleSelector = `style[data-surface-id="${surface.id}"]`;

    expect(document.head.querySelectorAll(styleSelector)).toHaveLength(2);
    expect(Registry.surface(surface.id)).toBe(surface);

    surface.destroy();

    expect(document.head.querySelectorAll(styleSelector)).toHaveLength(0);
    expect(Registry.surface(surface.id)).toBeUndefined();
    expect(surfaceElement.parentElement).toBe(containerElement);

    containerElement.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100, clientY: 100, button: 0 }));
    document.body.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 50, clientY: 50, button: 0 }));

    expect(surface.position.coords.x).toBe(0);
    expect(surface.position.coords.y).toBe(0);
  });

  test('Applies scaleGlideFactor to zoom glide vectors', () => {
    let captureGlideVector = (scaleGlideFactor: number) => {
      const { surface } = createSurface({ scaleGlideFactor });
      vi.spyOn(surface.scale, 'zoom').mockReturnValue({ new: 0.1, combined: 0.1, time: 400 });
      const glideSpy = vi.spyOn(surface.position, 'glide').mockReturnValue(true);

      surface.scale.stepAndGlide(1, { button: 0, x: 250, y: 300 });

      return glideSpy.mock.calls[0]![0];
    };

    const vectorDefault = captureGlideVector(1);
    const vectorAmplified = captureGlideVector(5);

    expect(vectorAmplified.x).toBeCloseTo(vectorDefault.x * 5);
    expect(vectorAmplified.y).toBeCloseTo(vectorDefault.y * 5);
  });

  test('Exposes typed config and destroy through public API', () => {
    const config: CustomConfig = { edgeMoveEnabled: true };
    const { containerElement, surfaceElement } = createElements();
    const tilted = new Tilted(containerElement, surfaceElement, config, []);

    expect(() => tilted.destroy()).not.toThrow();
  });
});
