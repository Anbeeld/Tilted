import { describe, expect, test } from 'vitest'
import Surface from '../../src/surface.js'
import { containerElement, surfaceElement } from './setup.js'

describe('Surface', () => {
  const surface = new Surface(containerElement, surfaceElement, {}, []);

  test('Checks width and height of container element', () => {
    expect(surface.containerWidth).toBe(3200);
    expect(surface.containerHeight).toBe(1800);
  });
  test('Checks width and height of surface element', () => {
    expect(surface.surfaceWidth).toBe(1600);
    expect(surface.surfaceHeight).toBe(900);
  });
});