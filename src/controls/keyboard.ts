import Surface from '../index.js';

export function buttonPressed(event: KeyboardEvent, surface: Surface) {
  if (surface.elements.container.matches(':hover')) {
    if (event.key === "Add" || event.key === "+") {
      surface.scale.step(1);
    } else if (event.key === "Subtract" || event.key === "-") {
      surface.scale.step(-1);
    }
  }
}