import Surface from '../surface.js';
import { MouseParams } from '../controls/mouse.js';
import { Direction } from '../utils.js';

export function moveSurfaceByEdge(surface: Surface, mouse: MouseParams) : boolean {
  if (surface.animationStorage.exists('surfaceDrag')) {
    return false;
  }

  let direction = {
    x: Direction.None,
    y: Direction.None
  };

  if (mouse.y <= surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
    if (mouse.x <= surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Left;
      direction.y = Direction.Top;
    } else if (mouse.x >= surface.containerWidth - surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Right;
      direction.y = Direction.Top;
    } else {
      direction.y = Direction.Top;
    }
  } else if (mouse.y >= surface.containerHeight - surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
    if (mouse.x <= surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Left;
      direction.y = Direction.Bottom;
    } else if (mouse.x >= surface.containerWidth - surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Right;
      direction.y = Direction.Bottom;
    } else {
      direction.y = Direction.Bottom;
    }
  } else {
    if (mouse.x <= surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Left;
    } else if (mouse.x >= surface.containerWidth - surface.CONFIG.EDGE_MOVE_AREA.VALUE) {
      direction.x = Direction.Right;
    }
  }

  let x = 0;
  let y = 0;
  if (direction.y !== Direction.None || direction.x !== Direction.None) {
    if (direction.y === Direction.Top) {
      y = (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1 - mouse.y) / (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1) * -1;
    } else if (direction.y === Direction.Bottom) {
      y = (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1 - (surface.containerHeight - mouse.y)) / (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1);
    }

    if (direction.x === Direction.Left) {
      x = (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1 - mouse.x) / (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1) * -1;
    } else if (direction.x === Direction.Right) {
      x = (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1 - (surface.containerWidth - mouse.x)) / (surface.CONFIG.EDGE_MOVE_AREA.VALUE + 1);
    }
  }

  let xMoveIsZero = false;
  if (x === 0 || (x > 0 && surface.coords.x >= surface.max.x) || (x < 0 && surface.coords.x <= surface.min.x)) {
    xMoveIsZero = true;
  }

  let yMoveIsZero = false;
  if (y === 0 || (y > 0 && surface.coords.y >= surface.max.y) || (y < 0 && surface.coords.y <= surface.min.y)) {
    yMoveIsZero = true;
  }

  if (xMoveIsZero && yMoveIsZero) {
    if (surface.animationStorage.exists('surfaceEdge')) {
      surface.animationStorage.destroy('surfaceEdge');
    }
    return false;
  }

  if (!surface.animationStorage.exists('surfaceEdge')) {
    surface.animationStorage.create('surfaceEdge', [{x, y}]);
    surface.animationExecutor.initiate();
  } else {
    surface.animationStorage.surfaceEdge!.update({x, y});
  }
  return true;
}