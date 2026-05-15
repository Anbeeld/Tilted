import { vi } from 'vitest'

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

export function createElements(containerSize = { width: 3200, height: 1800 }, surfaceSize = { width: 1600, height: 900 }) {
  const containerElement = document.createElement('div');
  const surfaceElement = document.createElement('div');
  containerElement.appendChild(surfaceElement);
  document.body.appendChild(containerElement);

  Object.defineProperties(containerElement, {
    offsetWidth: { value: containerSize.width },
    offsetHeight: { value: containerSize.height },
  });
  Object.defineProperties(surfaceElement, {
    offsetWidth: { value: surfaceSize.width },
    offsetHeight: { value: surfaceSize.height },
  });

  containerElement.getBoundingClientRect = () => ({
    left: 0,
    top: 0,
    right: containerSize.width,
    bottom: containerSize.height,
    width: containerSize.width,
    height: containerSize.height,
    x: 0,
    y: 0,
    toJSON() {
      return {};
    },
  });

  return { containerElement, surfaceElement };
}
