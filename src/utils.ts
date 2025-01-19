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

export enum EasingFunctions {
  EaseInOutSine = 'easeInOutSine',
  EaseInOutQuad = 'easeInOutQuad',
  EaseInOutCubic = 'easeInOutCubic',
  EaseInOutQuart = 'easeInOutQuart',
  EaseInOutQuint = 'easeInOutQuint',
  EaseInOutExpo = 'easeInOutExpo',
  EaseInOutCirc = 'easeInOutCirc'
}

export function applyEasingFunction(x: number, easingFunction: EasingFunctions = EasingFunctions.EaseInOutSine) : number {
  switch (easingFunction) {
    case EasingFunctions.EaseInOutSine:
      return -(Math.cos(Math.PI * x) - 1) / 2;
    case EasingFunctions.EaseInOutQuad:
      return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    case EasingFunctions.EaseInOutCubic:
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    case EasingFunctions.EaseInOutQuart:
      return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    case EasingFunctions.EaseInOutQuint:
      return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    case EasingFunctions.EaseInOutExpo:
      return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2;
    case EasingFunctions.EaseInOutCirc:
      return x < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
  }
}

// https://stackoverflow.com/a/66836940
export function nameOfProperty<T>(obj: T, expression: (x: { [Property in keyof T]: () => string }) => () => string): string {
  const res: { [Property in keyof T]: () => string } = {} as { [Property in keyof T]: () => string };
  Object.keys(obj!).map(k => res[k as keyof T] = () => k);
  return expression(res)();
}