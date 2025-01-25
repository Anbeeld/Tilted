export type Coords = {x: number, y: number};

export interface MoveChain {
  uuid: string,
  direction: {
    x: Direction,
    y: Direction
  },
  vector: {
    x: number,
    y: number
  }
}

export function roundFloat(value: number, precision: number) : number {
  return parseFloat(value.toFixed(precision));
}

export function roundTo(value: number, precision: number) : number {
  return Math.round(value / precision) * precision;
}

export function coordsToDirections(x: number, y: number) : {x: Direction, y: Direction} {
  return {
    x: x === 0 ? Direction.None : x < 0 ? Direction.Left : Direction.Right,
    y: y === 0 ? Direction.None : y < 0 ? Direction.Top : Direction.Bottom
  }
}

export enum Direction {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  None = 'none'
}

export function singedSqrt(value: number) : number {
  return Math.sign(value) * Math.sqrt(Math.abs(value));
}

export function clamp(value: number, min: number, max: number) : number {
  return Math.min(max, Math.max(min, value));
}

export function clampRatio(value: number) : number {
  return clamp(value, -1, 1);
}

// https://easings.net
export enum EasingFunctions {
  Linear = 'linear',
  EaseOutCirc = 'easeOutCirc',
}

export function applyEasingFunction(x: number, easingFunction: EasingFunctions = EasingFunctions.Linear) : number {
  switch (easingFunction) {
    case EasingFunctions.Linear:
      return x;
    case EasingFunctions.EaseOutCirc:
      return Math.sqrt(1 - Math.pow(x - 1, 2));
  }
}