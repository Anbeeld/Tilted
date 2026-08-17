import Surface from '../surface.js';
import { ConfigPropertyType } from '../config.js';

export function cssGenerated(surface: Surface) {
  let template = (name: string, value: number) => {
    return `` +
    `@property --tilted-${surface.id}-${name}{` +
      `syntax:"<length>";` +
      `inherits:true;` +
      `initial-value:${value}px;` +
    `}`;
  }

  return template('container-width', surface.containerWidth) +
  template('container-height', surface.containerHeight) +
  template('surface-width', surface.surfaceWidth) +
  template('surface-height', surface.surfaceHeight);
}

function getSyntaxToken(type: ConfigPropertyType): string {
  switch (type) {
    case ConfigPropertyType.Angle: return '<angle>';
    case ConfigPropertyType.Color: return '<color>';
    case ConfigPropertyType.Integer: return '<integer>';
    case ConfigPropertyType.Number: return '<number>';
    case ConfigPropertyType.Length: return '<length>';
    case ConfigPropertyType.Time: return '<time>';
    default: return '<number>';
  }
}

function getMeasure(type: ConfigPropertyType): string {
  switch (type) {
    case ConfigPropertyType.Angle: return 'deg';
    case ConfigPropertyType.Length: return 'px';
    case ConfigPropertyType.Time: return 'ms';
    default: return '';
  }
}

export function cssCore(surface: Surface) {
  let string = '';

  for (const parameter in (surface.CONFIG as any)) {
    const type = (surface.CONFIG as any)[parameter].TYPE as ConfigPropertyType;
    const measure = getMeasure(type);
    const syntaxToken = getSyntaxToken(type);

    string += `@property --${parameter} { `;
    string += `syntax:"${syntaxToken}"; `;
    string += `inherits:true; `;
    string += `initial-value:${(surface.CONFIG as any)[parameter].VALUE}${measure}; } `;
  }

  string +=
  `.${surface.selectors.container}${surface.selectors.surfaceId}{` +
    `position:relative !important;` +
    `cursor:move;` +
    `cursor:grab;` +
    `cursor:-moz-grab;` +
    `cursor:-webkit-grab;` +
    `-webkit-touch-callout:none;` +
    `-webkit-user-select:none;` +
    `-khtml-user-select:none;` +
    `-moz-user-select:none;` +
    `-ms-user-select:none;` +
    `user-select:none;` +
  `}` +

  `.${surface.selectors.container}${surface.selectors.surfaceId}:active{` +
    `cursor:grabbing;` +
    `cursor:-moz-grabbing;` +
    `cursor:-webkit-grabbing;` +
  `}` +
  
  `.${surface.selectors.controls}${surface.selectors.surfaceId}{` +
    `position:absolute;` +
    `top:100px;` +
    `right:30px;` +
    `width:30px;` +
    `border-radius:8px;` +
    `box-shadow:rgba(0, 0, 0, 0.16) 0px 1px 4px;` +
    `box-sizing:content-box;` +
    `overflow:hidden;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId},` +
  `.${surface.selectors.controlsZoomOut}${surface.selectors.surfaceId}{` +
    `position:relative;` +
    `width:30px;` +
    `height:30px;` +
    `background:#ffffffcc;` +
    `cursor:pointer;` +
    `box-sizing:content-box;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}{` +
    `border-bottom:1px solid #444444;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}:active,` +
  `.${surface.selectors.controlsZoomOut}${surface.selectors.surfaceId}:active{` +
    `background:#ffffff;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}:before,` +
  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}:after,` +
  `.${surface.selectors.controlsZoomOut}${surface.selectors.surfaceId}:before{` +
    `content:"";` +
    `display:block;` +
    `position:absolute;` +
    `background:#444444;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}:before,` +
  `.${surface.selectors.controlsZoomOut}${surface.selectors.surfaceId}:before{` +
    `height:2px;` +
    `width:18px;` +
    `top:14px;` +
    `left:6px;` +
  `}` +

  `.${surface.selectors.controlsZoomIn}${surface.selectors.surfaceId}:after{` +
    `height:18px;` +
    `width:2px;` +
    `top:6px;` +
    `left:14px;` +
  `}` +

  `.${surface.selectors.viewport}${surface.selectors.surfaceId}{` +
    `width:var(--tilted-${surface.id}-surface-width) !important;` +
    `height:var(--tilted-${surface.id}-surface-height) !important;` +
    `position:relative !important;` +
    `will-change:top,left;` +
  `}` +

  `.${surface.selectors.transform}${surface.selectors.surfaceId}{` +
    `width:var(--tilted-${surface.id}-surface-width) !important;` +
    `height:var(--tilted-${surface.id}-surface-height) !important;` +
    `will-change:transform;` +
  `}` +

  `.${surface.selectors.surface}${surface.selectors.surfaceId}{` +
    `position:relative !important;` +
    `overflow:visible !important;` +
    `z-index:100 !important;` +
  `}` +

  `.${surface.selectors.scene}${surface.selectors.surfaceId}>*:not(.${surface.selectors.figure}${surface.selectors.surfaceId}),` +
  `.${surface.selectors.figure}${surface.selectors.surfaceId}{` +
    `transform-origin:bottom;` +
  `}` +
  `.${surface.selectors.preserve3d}${surface.selectors.surfaceId}{` +
    `transform-style:preserve-3d;` +
  `}`;

  return string;
}