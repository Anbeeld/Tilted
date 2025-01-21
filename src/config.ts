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

  SCALE_STEP: ConfigProperty,
  SCALE_MIN: ConfigProperty,
  SCALE_DEFAULT: ConfigProperty,
  SCALE_MAX: ConfigProperty,
  SCALE_ROUNDING: ConfigProperty,
  SCALE_GLIDE: ConfigProperty,

  PERSPECTIVE_DISTANCE: ConfigProperty,
  SKEW_X_MAX: ConfigProperty,

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

  SCALE_ROUNDING_INTERIM: ConfigProperty, // Rounding of scale during animation
  SCALE_ROUNDING_FINAL: ConfigProperty // Rounding of scale after animation
}

export function setupConfig(configCustom: {}) : ConfigProperties {
  let config = {
    DEBUG_MODE: 0,

    SCALE_STEP: 0.20, // Percent of 1/2 total scale, e.g. 0.20 means 5 steps from 0.25 to 0.50 and 5 steps from 0.50 to 1
    SCALE_MIN: 0.25,
    SCALE_DEFAULT: 0.50,
    SCALE_MAX: 1.00,
    SCALE_ROUNDING: 3,
    SCALE_GLIDE: 0.10,

    PERSPECTIVE_DISTANCE: 600,
    SKEW_X_MAX: 35,

    EDGE_MOVE_ENABLED: 0,
    EDGE_MOVE_AREA: 20,
    EDGE_MOVE_SPEED: 10,
    
    ANIMATION_SCALE_TIME: 400,
    ANIMATION_GLIDE_TIME: 400,

    DURATION_FOR_THROW: 150,
    THROW_MULTIPLIER: 4,
    ANIMATION_THROW_TIME: 1000,

    COORD_ROUNDING_INTERIM: 1,
    COORD_ROUNDING_FINAL: 0,

    SCALE_ROUNDING_INTERIM: 4,
    SCALE_ROUNDING_FINAL: 2
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

  const CONFIG = {
    DEBUG_MODE: {
      VALUE: config.DEBUG_MODE,
      TYPE: ConfigPropertyType.Integer
    },

    SCALE_STEP: {
      VALUE: config.SCALE_STEP,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MIN: {
      VALUE: config.SCALE_MIN,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_DEFAULT: {
      VALUE: config.SCALE_DEFAULT,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_MAX: {
      VALUE: config.SCALE_MAX,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_ROUNDING: {
      VALUE: config.SCALE_ROUNDING,
      TYPE: ConfigPropertyType.Number
    },
    SCALE_GLIDE: {
      VALUE: config.SCALE_GLIDE,
      TYPE: ConfigPropertyType.Number
    },

    PERSPECTIVE_DISTANCE: {
      VALUE: Math.round(config.PERSPECTIVE_DISTANCE),
      TYPE: ConfigPropertyType.Length
    },
    SKEW_X_MAX: {
      VALUE: Math.round(config.SKEW_X_MAX),
      TYPE: ConfigPropertyType.Angle
    },

    EDGE_MOVE_ENABLED: {
      VALUE: config.EDGE_MOVE_ENABLED,
      TYPE: ConfigPropertyType.Integer
    },
    EDGE_MOVE_AREA: {
      VALUE: Math.round(config.EDGE_MOVE_AREA),
      TYPE: ConfigPropertyType.Length
    },
    EDGE_MOVE_SPEED: {
      VALUE: Math.round(config.EDGE_MOVE_SPEED),
      TYPE: ConfigPropertyType.Length
    },

    ANIMATION_SCALE_TIME: {
      VALUE: Math.round(config.ANIMATION_SCALE_TIME),
      TYPE: ConfigPropertyType.Time
    },
    ANIMATION_GLIDE_TIME: {
      VALUE: Math.round(config.ANIMATION_GLIDE_TIME),
      TYPE: ConfigPropertyType.Time
    },
    
    DURATION_FOR_THROW: {
      VALUE: Math.round(config.DURATION_FOR_THROW),
      TYPE: ConfigPropertyType.Time
    },
    THROW_MULTIPLIER: {
      VALUE: config.THROW_MULTIPLIER,
      TYPE: ConfigPropertyType.Number
    },
    ANIMATION_THROW_TIME: {
      VALUE: Math.round(config.ANIMATION_THROW_TIME),
      TYPE: ConfigPropertyType.Time
    },

    COORD_ROUNDING_INTERIM: {
      VALUE: config.COORD_ROUNDING_INTERIM,
      TYPE: ConfigPropertyType.Integer
    },
    COORD_ROUNDING_FINAL: {
      VALUE: config.COORD_ROUNDING_FINAL,
      TYPE: ConfigPropertyType.Integer
    },

    SCALE_ROUNDING_INTERIM: {
      VALUE: config.SCALE_ROUNDING_INTERIM,
      TYPE: ConfigPropertyType.Integer
    },
    SCALE_ROUNDING_FINAL: {
      VALUE: config.SCALE_ROUNDING_FINAL,
      TYPE: ConfigPropertyType.Integer
    }
  };

  return CONFIG;
}