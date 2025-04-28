import { vi } from 'vitest'

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub the global ResizeObserver
vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Create HTML structure required for Surface object
const containerElement = document.createElement('div');
const surfaceElement = document.createElement('div');
containerElement.appendChild(surfaceElement);

// Set width and height of elements
Object.defineProperties(containerElement, {
  offsetWidth: { value: 3200 },
  offsetHeight: { value: 1800 },
});
Object.defineProperties(surfaceElement, {
  offsetWidth: { value: 1600 },
  offsetHeight: { value: 900 },
});

export { containerElement, surfaceElement };