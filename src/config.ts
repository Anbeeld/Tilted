import { mangleProperty } from "./mangle.js"

type ConfigProperty = {
  VALUE: number,
  TYPE: ConfigPropertyType
}

export enum ConfigPropertyType {
  Angle = 'angle',
  Color = 'color',
  Integer = 'integer',
  Number = 'number',
  Length = 'length',
  Time = 'time'
}

export type CustomConfig = {
  scaleMin?: number,
  scaleMax?: number,
  scaleNumSteps?: number,
  scaleDefaultStep?: number,
  scaleRounding?: number,
  scaleGlideFactor?: number,

  perspectiveValue?: number,
  perspectiveFactor?: number,

  tiltMin?: number,
  tiltMax?: number,
  tiltRounding?: number,
  
  limitTopOffset?: number,
  limitRightOffset?: number,
  limitBottomOffset?: number,
  limitLeftOffset?: number,

  limitSurfaceWidthFactor?: number,
  limitSurfaceHeightFactor?: number,
  limitContainerWidthFactor?: number,
  limitContainerHeightFactor?: number,

  edgeMoveEnabled?: boolean,
  edgeMoveArea?: number,
  edgeMoveSpeed?: number,

  animationScaleTime?: number,
  animationGlideTime?: number,

  durationForToss?: number,
  tossGlideFactor?: number,
  animationTossTime?: number,

  coordRoundingInterim?: number,
  coordRoundingFinal?: number
}

export type Config = {
  SCALE_MIN: ConfigProperty,
  SCALE_MAX: ConfigProperty,
  SCALE_NUM_STEPS: ConfigProperty,
  SCALE_DEFAULT_STEP: ConfigProperty,
  SCALE_ROUNDING: ConfigProperty,
  SCALE_GLIDE_FACTOR: ConfigProperty,

  PERSPECTIVE_VALUE: ConfigProperty,
  PERSPECTIVE_FACTOR: ConfigProperty,

  TILT_MIN: ConfigProperty,
  TILT_MAX: ConfigProperty,
  TILT_ROUNDING: ConfigProperty,

  LIMIT_TOP_OFFSET: ConfigProperty,
  LIMIT_RIGHT_OFFSET: ConfigProperty,
  LIMIT_BOTTOM_OFFSET: ConfigProperty,
  LIMIT_LEFT_OFFSET: ConfigProperty,

  LIMIT_SURFACE_WIDTH_FACTOR: ConfigProperty,
  LIMIT_SURFACE_HEIGHT_FACTOR: ConfigProperty,
  LIMIT_CONTAINER_WIDTH_FACTOR: ConfigProperty,
  LIMIT_CONTAINER_HEIGHT_FACTOR: ConfigProperty,

  EDGE_MOVE_ENABLED: ConfigProperty,
  EDGE_MOVE_AREA: ConfigProperty,
  EDGE_MOVE_SPEED: ConfigProperty,

  ANIMATION_SCALE_TIME: ConfigProperty,
  ANIMATION_GLIDE_TIME: ConfigProperty,

  DURATION_FOR_TOSS: ConfigProperty,
  TOSS_GLIDE_FACTOR: ConfigProperty,
  ANIMATION_TOSS_TIME: ConfigProperty,

  COORD_ROUNDING_INTERIM: ConfigProperty, // Rounding of coordinates during animation
  COORD_ROUNDING_FINAL: ConfigProperty // Rounding of coordinates after animation
}

export function setupConfig(custom: CustomConfig) : Config {
  let getConfigProperty = (name: keyof CustomConfig, round: boolean = false) : number|undefined => {
    let value = mangleProperty(custom, name);
    if (typeof value === 'number') {
      if (round) {
        return Math.round(value);
      }
      return value;
    } else if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    return undefined;
  }

  const CONFIG = {
    SCALE_MIN: { // The smallest surface can be scaled to, e.g. 25% of its actual size as per default
      VALUE: getConfigProperty('scaleMin') ?? 0.25,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MAX: { // The largest surface can be scaled to, e.g. 100% of its actual size as per default
      VALUE: getConfigProperty('scaleMax') ?? 1.00,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_NUM_STEPS: { // Num scaling steps, more steps -> more granularity in scaling and longer to scale all the way
      VALUE: getConfigProperty('scaleNumSteps') ?? 15,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_DEFAULT_STEP: { // Scaling step that will be set by default - min is 1, max is scaleNumSteps
      VALUE: getConfigProperty('scaleDefaultStep') ?? 8,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_ROUNDING: { // Scale value and everything related will be rounded to this number of decimals
      VALUE: getConfigProperty('scaleRounding') ?? 3,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_GLIDE_FACTOR: { // Multiplier of glide vector length when scaling towards mouse cursor
      VALUE: getConfigProperty('scaleGlideFactor') ?? 1,
      TYPE: ConfigPropertyType.Number
    },

    PERSPECTIVE_VALUE: { // Default perspective distance in pixels
      VALUE: getConfigProperty('perspectiveValue') ?? 750,
      TYPE: ConfigPropertyType.Integer
    },
    PERSPECTIVE_FACTOR: { // Multiplier of perspective distance, use whatever fits you between this and value
      VALUE: getConfigProperty('perspectiveFactor', true) ?? 1,
      TYPE: ConfigPropertyType.Length
    },

    TILT_MIN: { // Angle of surface tilt at scaleMin
      VALUE: getConfigProperty('tiltMin', true) ?? 0,
      TYPE: ConfigPropertyType.Angle
    },
    TILT_MAX: { // Angle of surface tilt at scaleMax
      VALUE: getConfigProperty('tiltMax', true) ?? 35,
      TYPE: ConfigPropertyType.Angle
    },
    TILT_ROUNDING: { // Tilt value and everything related will be rounded to this number of decimals
      VALUE: getConfigProperty('tiltRounding', true) ?? 2,
      TYPE: ConfigPropertyType.Integer
    },

    LIMIT_TOP_OFFSET: { // Top limit in pixels
      VALUE: getConfigProperty('limitTopOffset', true) ?? 0,
      TYPE: ConfigPropertyType.Integer
    },
    LIMIT_RIGHT_OFFSET: { // Right limit in pixels
      VALUE: getConfigProperty('limitRightOffset', true) ?? 0,
      TYPE: ConfigPropertyType.Integer
    },
    LIMIT_BOTTOM_OFFSET: { // Bottom limit in pixels
      VALUE: getConfigProperty('limitBottomOffset', true) ?? 0,
      TYPE: ConfigPropertyType.Integer
    },
    LIMIT_LEFT_OFFSET: { // Left limit in pixels
      VALUE: getConfigProperty('limitLeftOffset', true) ?? 0,
      TYPE: ConfigPropertyType.Integer
    },

    LIMIT_SURFACE_WIDTH_FACTOR: { // Multiplier of surface width at scaleMin
      VALUE: getConfigProperty('limitSurfaceWidthFactor') ?? 0.50,
      TYPE: ConfigPropertyType.Number
    },
    LIMIT_SURFACE_HEIGHT_FACTOR: { // Multiplier of surface height at scaleMin
      VALUE: getConfigProperty('limitSurfaceHeightFactor') ?? 0.50,
      TYPE: ConfigPropertyType.Number
    },
    LIMIT_CONTAINER_WIDTH_FACTOR: { // Multiplier of container width at scaleMin
      VALUE: getConfigProperty('limitContainerWidthFactor') ?? 0.25,
      TYPE: ConfigPropertyType.Number
    },
    LIMIT_CONTAINER_HEIGHT_FACTOR: { // Multiplier of container height at scaleMin
      VALUE: getConfigProperty('limitContainerHeightFactor') ?? 0.25,
      TYPE: ConfigPropertyType.Number
    },

    EDGE_MOVE_ENABLED: { // If surface moving by moving mouse cursor to the edge of viewport is enabled
      VALUE: getConfigProperty('edgeMoveEnabled') ?? 0,
      TYPE: ConfigPropertyType.Integer
    },
    EDGE_MOVE_AREA: { // Edge move area width in pixels
      VALUE: getConfigProperty('edgeMoveArea', true) ?? 20,
      TYPE: ConfigPropertyType.Length
    },
    EDGE_MOVE_SPEED: { // Max speed of surface edge moving, actual depends on cursor position inside edge etc.
      VALUE: getConfigProperty('edgeMoveSpeed', true) ?? 10,
      TYPE: ConfigPropertyType.Length
    },

    ANIMATION_SCALE_TIME: { // Default duration of scale animation in ms, can be shortened for small shifts
      VALUE: getConfigProperty('animationScaleTime', true) ?? 400,
      TYPE: ConfigPropertyType.Time
    },
    ANIMATION_GLIDE_TIME: { // Default duration of glide animation in ms, note that scale glides use animationScaleTime
      VALUE: getConfigProperty('animationGlideTime', true) ?? 400,
      TYPE: ConfigPropertyType.Time
    },

    DURATION_FOR_TOSS: { // Dragging with duration fewer than this will result in toss
      VALUE: getConfigProperty('durationForToss', true) ?? 150,
      TYPE: ConfigPropertyType.Time
    },
    TOSS_GLIDE_FACTOR: { // Multiplier of toss glide vector, which itself is roughly equal to dragging distance
      VALUE: getConfigProperty('tossGlideFactor') ?? 1,
      TYPE: ConfigPropertyType.Number
    },
    ANIMATION_TOSS_TIME: { // Default duration of toss animation in ms
      VALUE: getConfigProperty('animationTossTime', true) ?? 1000,
      TYPE: ConfigPropertyType.Time
    },

    COORD_ROUNDING_INTERIM: { // Surface coords during movement will be rounded to this number of decimals
      VALUE: getConfigProperty('coordRoundingInterim', true) ?? 1,
      TYPE: ConfigPropertyType.Integer
    },
    COORD_ROUNDING_FINAL: { // Surface coords after movement ends will be rounded to this number of decimals
      VALUE: getConfigProperty('coordRoundingFinal', true) ?? 0,
      TYPE: ConfigPropertyType.Integer
    }
  };

  if (CONFIG.SCALE_MIN.VALUE < 0) {
    throw new Error(`scaleMin must be >= 0, got ${CONFIG.SCALE_MIN.VALUE}`);
  }
  if (CONFIG.SCALE_MAX.VALUE <= 0) {
    throw new Error(`scaleMax must be > 0, got ${CONFIG.SCALE_MAX.VALUE}`);
  }
  if (CONFIG.SCALE_MIN.VALUE > CONFIG.SCALE_MAX.VALUE) {
    throw new Error(`scaleMin (${CONFIG.SCALE_MIN.VALUE}) must be <= scaleMax (${CONFIG.SCALE_MAX.VALUE})`);
  }
  if (CONFIG.SCALE_NUM_STEPS.VALUE < 2) {
    throw new Error(`scaleNumSteps must be >= 2, got ${CONFIG.SCALE_NUM_STEPS.VALUE}`);
  }
  if (CONFIG.SCALE_DEFAULT_STEP.VALUE < 1 || CONFIG.SCALE_DEFAULT_STEP.VALUE > CONFIG.SCALE_NUM_STEPS.VALUE) {
    throw new Error(`scaleDefaultStep must be >= 1 and <= scaleNumSteps (${CONFIG.SCALE_NUM_STEPS.VALUE}), got ${CONFIG.SCALE_DEFAULT_STEP.VALUE}`);
  }

  return CONFIG;
}
