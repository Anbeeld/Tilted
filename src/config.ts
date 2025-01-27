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
  DEBUG_MODE: ConfigProperty,

  SCALE_MIN: ConfigProperty,
  SCALE_MAX: ConfigProperty,
  SCALE_NUM_STEPS: ConfigProperty,
  SCALE_DEFAULT_STEP: ConfigProperty,
  SCALE_ROUNDING: ConfigProperty,
  SCALE_GLIDE: ConfigProperty,

  PERSPECTIVE_DISTANCE: ConfigProperty,

  ROTATE_X_MAX: ConfigProperty,
  ROTATE_ROUNDING: ConfigProperty,

  EDGE_MOVE_ENABLED: ConfigProperty,
  EDGE_MOVE_AREA: ConfigProperty,
  EDGE_MOVE_SPEED: ConfigProperty,

  ANIMATION_SCALE_TIME: ConfigProperty,
  ANIMATION_GLIDE_TIME: ConfigProperty,

  DURATION_FOR_THROW: ConfigProperty,
  THROW_MULTIPLIER: ConfigProperty,
  ANIMATION_THROW_TIME: ConfigProperty,

  COORD_ROUNDING_INTERIM: ConfigProperty, // Rounding of coordinates during animation
  COORD_ROUNDING_FINAL: ConfigProperty // Rounding of coordinates after animation
}

export function setupConfig(configCustom: {}) : ConfigProperties {
  let config = {
    debugMode: 0,

    scaleMin: 0.25,
    scaleMax: 1.00,
    scaleNumSteps: 15,
    scaleDefaultStep: 8,
    scaleRounding: 3,
    scaleGlide: 1,

    perspectiveDistance: 600,

    rotateXMax: 35,
    rotateRounding: 2,

    edgeMoveEnabled: 0,
    edgeMoveArea: 20,
    edgeMoveSpeed: 10,
    
    animationScaleTime: 400,
    animationGlideTime: 400,

    durationForThrow: 150,
    throwMultiplier: 1,
    animationThrowTime: 1000,

    coordRoundingInterim: 1,
    coordRoundingFinal: 0
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

  let scaleSteps = calculateSteps(config.scaleMin, config.scaleMax, config.scaleNumSteps, config.scaleRounding);
  /*config.debugMode && */console.log('Scale steps: ', scaleSteps);

  const CONFIG = {
    DEBUG_MODE: {
      VALUE: config.debugMode,
      TYPE: ConfigPropertyType.Integer
    },

    SCALE_MIN: {
      VALUE: config.scaleMin,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MAX: {
      VALUE: config.scaleMax,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_NUM_STEPS: {
      VALUE: config.scaleNumSteps,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_DEFAULT_STEP: {
      VALUE: config.scaleDefaultStep,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_ROUNDING: {
      VALUE: config.scaleRounding,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_GLIDE: {
      VALUE: config.scaleGlide,
      TYPE: ConfigPropertyType.Number
    },

    PERSPECTIVE_DISTANCE: {
      VALUE: Math.round(config.perspectiveDistance),
      TYPE: ConfigPropertyType.Length
    },

    ROTATE_X_MAX: {
      VALUE: Math.round(config.rotateXMax),
      TYPE: ConfigPropertyType.Angle
    },
    ROTATE_ROUNDING: {
      VALUE: config.rotateRounding,
      TYPE: ConfigPropertyType.Integer
    },

    EDGE_MOVE_ENABLED: {
      VALUE: config.edgeMoveEnabled,
      TYPE: ConfigPropertyType.Integer
    },
    EDGE_MOVE_AREA: {
      VALUE: Math.round(config.edgeMoveArea),
      TYPE: ConfigPropertyType.Length
    },
    EDGE_MOVE_SPEED: {
      VALUE: Math.round(config.edgeMoveSpeed),
      TYPE: ConfigPropertyType.Length
    },

    ANIMATION_SCALE_TIME: {
      VALUE: Math.round(config.animationScaleTime),
      TYPE: ConfigPropertyType.Time
    },
    ANIMATION_GLIDE_TIME: {
      VALUE: Math.round(config.animationGlideTime),
      TYPE: ConfigPropertyType.Time
    },
    
    DURATION_FOR_THROW: {
      VALUE: Math.round(config.durationForThrow),
      TYPE: ConfigPropertyType.Time
    },
    THROW_MULTIPLIER: {
      VALUE: config.throwMultiplier,
      TYPE: ConfigPropertyType.Number
    },
    ANIMATION_THROW_TIME: {
      VALUE: Math.round(config.animationThrowTime),
      TYPE: ConfigPropertyType.Time
    },

    COORD_ROUNDING_INTERIM: {
      VALUE: config.coordRoundingInterim,
      TYPE: ConfigPropertyType.Integer
    },
    COORD_ROUNDING_FINAL: {
      VALUE: config.coordRoundingFinal,
      TYPE: ConfigPropertyType.Integer
    }
  };

  return CONFIG;
}