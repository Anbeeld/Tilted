import { getProperty } from "./utils.js"

type ConfigProperty = {
  VALUE: number,
  TYPE: ConfigPropertyType
}

enum ConfigPropertyType {
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

  edgeMoveEnabled?: number,
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
  let customValue = (name: keyof CustomConfig, round: boolean = false) : number|undefined => {
    let value = getProperty(custom, name);
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
      VALUE: customValue('scaleMin') || 0.25,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MAX: { // The largest surface can be scaled to, e.g. 100% of its actual size as per default
      VALUE: customValue('scaleMax') || 1.00,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_NUM_STEPS: { // Num scaling steps, more steps -> more granularity in scaling and longer to scale all the way
      VALUE: customValue('scaleNumSteps') || 15,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_DEFAULT_STEP: { // Scaling step that will be set by default - min is 1, max is scaleNumSteps
      VALUE: customValue('scaleDefaultStep') || 8,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_ROUNDING: { // Scale value and everything related will be rounded to this number of decimals
      VALUE: customValue('scaleRounding') || 3,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_GLIDE_FACTOR: { // Multiplier of glide vector length when scaling towards mouse cursor
      VALUE: customValue('scaleGlideFactor') || 1,
      TYPE: ConfigPropertyType.Number
    },

    PERSPECTIVE_VALUE: { // Default perspective distance in pixels
      VALUE: customValue('perspectiveValue') || 750,
      TYPE: ConfigPropertyType.Integer
    },
    PERSPECTIVE_FACTOR: { // Multiplier of perspective distance, use whatever fits you between this and value
      VALUE: customValue('perspectiveFactor', true) || 1,
      TYPE: ConfigPropertyType.Length
    },

    TILT_MIN: { // Angle of surface tilt at scaleMin
      VALUE: customValue('tiltMin', true) || 0,
      TYPE: ConfigPropertyType.Angle
    },
    TILT_MAX: { // Angle of surface tilt at scaleMax
      VALUE: customValue('tiltMax', true) || 35,
      TYPE: ConfigPropertyType.Angle
    },
    TILT_ROUNDING: { // Tilt value and everything related will be rounded to this number of decimals
      VALUE: customValue('tiltRounding', true) || 2,
      TYPE: ConfigPropertyType.Integer
    },

    EDGE_MOVE_ENABLED: { // If surface moving by moving mouse cursor to the edge of viewport is enabled
      VALUE: customValue('edgeMoveEnabled') ? 1 : 0,
      TYPE: ConfigPropertyType.Integer
    },
    EDGE_MOVE_AREA: { // Edge move area width in pixels
      VALUE: customValue('edgeMoveArea', true) || 20,
      TYPE: ConfigPropertyType.Length
    },
    EDGE_MOVE_SPEED: { // Max speed of surface edge moving, actual depends on cursor position inside edge etc.
      VALUE: customValue('edgeMoveSpeed', true) || 10,
      TYPE: ConfigPropertyType.Length
    },

    ANIMATION_SCALE_TIME: { // Default duration of scale animation in ms, can be shortened for small shifts
      VALUE: customValue('animationScaleTime', true) || 400,
      TYPE: ConfigPropertyType.Time
    },
    ANIMATION_GLIDE_TIME: { // Default duration of glide animation in ms, note that scale glides use animationScaleTime
      VALUE: customValue('animationGlideTime', true) || 400,
      TYPE: ConfigPropertyType.Time
    },
    
    DURATION_FOR_TOSS: { // Dragging with duration fewer than this will result in toss
      VALUE: customValue('durationForToss', true) || 150,
      TYPE: ConfigPropertyType.Time
    },
    TOSS_GLIDE_FACTOR: { // Multiplier of toss glide vector, which itself is roughly equal to dragging distance
      VALUE: customValue('tossGlideFactor') || 1,
      TYPE: ConfigPropertyType.Number
    },
    ANIMATION_TOSS_TIME: { // Default duration of toss animation in ms
      VALUE: customValue('animationTossTime', true) || 1000,
      TYPE: ConfigPropertyType.Time
    },

    COORD_ROUNDING_INTERIM: { // Surface coords during movement will be rounded to this number of decimals
      VALUE: customValue('coordRoundingInterim', true) || 1,
      TYPE: ConfigPropertyType.Integer
    },
    COORD_ROUNDING_FINAL: { // Surface coords after movement ends will be rounded to this number of decimals
      VALUE: customValue('coordRoundingFinal', true) || 0,
      TYPE: ConfigPropertyType.Integer
    }
  };

  return CONFIG;
}