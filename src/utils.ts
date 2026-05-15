export type Coords = {x: number, y: number};

export function roundFloat(value: number, precision: number) : number {
  return parseFloat(value.toFixed(precision));
}

export enum Direction {
  Top = 'top',
  Bottom = 'bottom',
  Left = 'left',
  Right = 'right',
  None = 'none'
}

export function signedSqrt(value: number) : number {
  return Math.sign(value) * Math.sqrt(Math.abs(value));
}

export function clamp(value: number, min: number, max: number) : number {
  return Math.min(max, Math.max(min, value));
}

export function clampRatio(value: number) : number {
  return clamp(value, 0, 1);
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
    default:
      return x;
  }
}

export function calculateSteps(min: number, max: number, numSteps: number, rounding: number) : number[] {
  let steps = [max];

  // https://math.stackexchange.com/a/31345
  let logarithmNumber = min / max;
  let logarithmResult = numSteps - 1;
  let logarithmBase = Math.pow(logarithmNumber, 1 / logarithmResult);

  for (let i = 1; i < numSteps - 1; i++) {
    steps.push(steps[steps.length - 1]! * logarithmBase);
  }
  steps.push(min);
  for (let i = 0; i < numSteps; i++) {
    steps[i] = roundFloat(steps[i]!, rounding);
  }
  return steps.reverse();
}

export function calculateShiftsToStep(steps: number[], rounding: number) : {up: number, down: number}[] {
  let shiftsToStep : {up: number, down: number}[] = [];
  for (let i = 0; i < steps.length; i++) {
    shiftsToStep.push({
      up: i === steps.length - 1 ? 0 : roundFloat(steps[i + 1]! - steps[i]!, rounding),
      down: i === 0 ? 0 : roundFloat(steps[i]! - steps[i - 1]!, rounding)
    });
  }
  return shiftsToStep;
}

export function findClosestInArray(array: number[], value: number) : number {
  return array.reduce(function(prev, curr) {
    return (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
  });
}

export function multiplyCssDegrees(value: string, multiplier: number, rounding: number) : string {
  return roundFloat(parseFloat(value.replace('deg', '')) * multiplier, rounding) + 'deg';
}