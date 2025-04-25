import { calculateSteps } from "./utils.js";

enum ConfigPropertyType {
  Angle = 'angle',
  Color = 'color',
  Integer = 'integer',
  Number = 'number',
  Length = 'length',
  Time = 'time'
}

interface ConfigProperty {
  VALUE: any,
  TYPE: ConfigPropertyType
}

export interface ConfigProperties {
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

export function setupConfig(configCustom: {}) : ConfigProperties {
  let config = {
    $scaleMin: 0.25, // The smallest surface can be scaled to, e.g. 25% of its actual size as per default
    $scaleMax: 1.00, // The largest surface can be scaled to, e.g. 100% of its actual size as per default
    $scaleNumSteps: 15, // Num scaling steps, more steps -> more granularity in scaling and longer to scale all the way
    $scaleDefaultStep: 8, // Scaling step that will be set by default - min is 1, max is scaleNumSteps
    $scaleRounding: 3, // Scale value and everything related will be rounded to this number of decimals
    $scaleGlideFactor: 1, // Multiplier of glide vector length when scaling towards mouse cursor

    $perspectiveValue: 750, // Default perspective distance in pixels
    $perspectiveFactor: 1, // Multiplier of perspective distance, use whatever fits you between this and value

    $tiltMin: 0, // Angle of surface tilt at scaleMin
    $tiltMax: 35, // Angle of surface tilt at scaleMax
    $tiltRounding: 2, // Tilt value and everything related will be rounded to this number of decimals

    $edgeMoveEnabled: 0, // If surface moving by moving mouse cursor to the edge of viewport is enabled
    $edgeMoveArea: 20, // Edge move area width in pixels
    $edgeMoveSpeed: 10, // Max speed of surface edge moving, actual depends on cursor position inside edge etc.
    
    $animationScaleTime: 400, // Default duration of scale animation in ms, can be shortened for small shifts 
    $animationGlideTime: 400, // Default duration of glide animation in ms, note that scale glides use animationScaleTime

    $durationForToss: 150, // Dragging with duration fewer than this will result in toss
    $tossGlideFactor: 1, // Multiplier of toss glide vector, which itself is roughly equal to dragging distance
    $animationTossTime: 1000, // Default duration of toss animation in ms

    $coordRoundingInterim: 1, // Surface coords during movement will be rounded to this number of decimals
    $coordRoundingFinal: 0 // Surface coords after movement ends will be rounded to this number of decimals
  }

  for (const parameter in configCustom) {
    if ((config as any).hasOwnProperty(parameter)) {
      let value = (configCustom as any)[parameter];
      if (value === true) {
        value = 1;
      } else if (value === false) {
        value = 0;
      }
      (config as any)[parameter] = value;
    }
  }

  false && console.log('Scale steps: ', calculateSteps(config.$scaleMin, config.$scaleMax, config.$scaleNumSteps, config.$scaleRounding));

  const CONFIG = {
    SCALE_MIN: {
      VALUE: config.$scaleMin,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MAX: {
      VALUE: config.$scaleMax,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_NUM_STEPS: {
      VALUE: config.$scaleNumSteps,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_DEFAULT_STEP: {
      VALUE: config.$scaleDefaultStep,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_ROUNDING: {
      VALUE: config.$scaleRounding,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_GLIDE_FACTOR: {
      VALUE: config.$scaleGlideFactor,
      TYPE: ConfigPropertyType.Number
    },

    PERSPECTIVE_VALUE: {
      VALUE: config.$perspectiveValue,
      TYPE: ConfigPropertyType.Integer
    },
    PERSPECTIVE_FACTOR: {
      VALUE: Math.round(config.$perspectiveFactor),
      TYPE: ConfigPropertyType.Length
    },

    TILT_MIN: {
      VALUE: Math.round(config.$tiltMin),
      TYPE: ConfigPropertyType.Angle
    },
    TILT_MAX: {
      VALUE: Math.round(config.$tiltMax),
      TYPE: ConfigPropertyType.Angle
    },
    TILT_ROUNDING: {
      VALUE: config.$tiltRounding,
      TYPE: ConfigPropertyType.Integer
    },

    EDGE_MOVE_ENABLED: {
      VALUE: config.$edgeMoveEnabled,
      TYPE: ConfigPropertyType.Integer
    },
    EDGE_MOVE_AREA: {
      VALUE: Math.round(config.$edgeMoveArea),
      TYPE: ConfigPropertyType.Length
    },
    EDGE_MOVE_SPEED: {
      VALUE: Math.round(config.$edgeMoveSpeed),
      TYPE: ConfigPropertyType.Length
    },

    ANIMATION_SCALE_TIME: {
      VALUE: Math.round(config.$animationScaleTime),
      TYPE: ConfigPropertyType.Time
    },
    ANIMATION_GLIDE_TIME: {
      VALUE: Math.round(config.$animationGlideTime),
      TYPE: ConfigPropertyType.Time
    },
    
    DURATION_FOR_TOSS: {
      VALUE: Math.round(config.$durationForToss),
      TYPE: ConfigPropertyType.Time
    },
    TOSS_GLIDE_FACTOR: {
      VALUE: config.$tossGlideFactor,
      TYPE: ConfigPropertyType.Number
    },
    ANIMATION_TOSS_TIME: {
      VALUE: Math.round(config.$animationTossTime),
      TYPE: ConfigPropertyType.Time
    },

    COORD_ROUNDING_INTERIM: {
      VALUE: config.$coordRoundingInterim,
      TYPE: ConfigPropertyType.Integer
    },
    COORD_ROUNDING_FINAL: {
      VALUE: config.$coordRoundingFinal,
      TYPE: ConfigPropertyType.Integer
    }
  };

  return CONFIG;
}