import { nameOfProperty } from '../utils.js';
import Surface from '../index.js';

export function generateCssDynamic(surface: Surface) {
  return `` +
  `@property --tilted-container-width-` + surface.id + ` {` +
    `syntax:"<length>";` +
    `inherits:true;` +
    `initial-value:` + surface.containerWidth + `px;` +
  `}` +
  `@property --tilted-container-height-` + surface.id + ` {` +
    `syntax:"<length>";` +
    `inherits:true;` +
    `initial-value:` + surface.containerHeight + `px;` +
  `}` +

  `@property --tilted-surface-width-` + surface.id + ` {` +
    `syntax:"<length>";` +
    `inherits:true;` +
    `initial-value:` + surface.surfaceWidth + `px;` +
  `}` +
  `@property --tilted-surface-height-` + surface.id + ` {` +
    `syntax:"<length>";` +
    `inherits:true;` +
    `initial-value:` + surface.surfaceHeight + `px;` +
  `}`;
}

export function generateCssStatic(surface: Surface) {
  let string = '';

  for (const parameter in (surface.CONFIG as any)) {
    let measure = '';
    if ((surface.CONFIG as any)[parameter].TYPE === 'length') {
      measure = 'px';
    } else if ((surface.CONFIG as any)[parameter].TYPE === 'angle') {
      measure = 'deg';
    } else if ((surface.CONFIG as any)[parameter].TYPE === 'time') {
      measure = 'ms';
    }

    string += `@property --${parameter} { `;
    string += `syntax:"<${(surface.CONFIG as any)[parameter].TYPE}>"; `;
    string += `inherits:true; `;
    string += `initial-value:${(surface.CONFIG as any)[parameter].VALUE}${measure}; } `;
  }

  string +=
  `.tilted-container-` + surface.id + `{` +
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

  `.tilted-container-` + surface.id + `:active{` +
    `cursor:grabbing;` +
    `cursor:-moz-grabbing;` +
    `cursor:-webkit-grabbing;` +
  `}` +
  
  `.tilted-controls-` + surface.id + `{` +
    `position:absolute;` +
    `top:100px;` +
    `right:30px;` +
    `width:30px;` +
    `border-radius:8px;` +
    `box-shadow:rgba(0, 0, 0, 0.16) 0px 1px 4px;` +
    `box-sizing:content-box;` +
    `overflow:hidden;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `,` +
  `.tilted-controls-zoom-out-` + surface.id + `{` +
    `position:relative;` +
    `width:30px;` +
    `height:30px;` +
    `background:#ffffffcc;` +
    `cursor:pointer;` +
    `box-sizing:content-box;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `{` +
    `border-bottom:1px solid #444444;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `:active,` +
  `.tilted-controls-zoom-out-` + surface.id + `:active{` +
    `background:#ffffff;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `:before,` +
  `.tilted-controls-zoom-in-` + surface.id + `:after,` +
  `.tilted-controls-zoom-out-` + surface.id + `:before{` +
    `content:"";` +
    `display:block;` +
    `position:absolute;` +
    `background:#444444;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `:before,` +
  `.tilted-controls-zoom-out-` + surface.id + `:before{` +
    `height:2px;` +
    `width:18px;` +
    `top:14px;` +
    `left:6px;` +
  `}` +

  `.tilted-controls-zoom-in-` + surface.id + `:after{` +
    `height:18px;` +
    `width:2px;` +
    `top:6px;` +
    `left:14px;` +
  `}` +

  `.tilted-viewport-` + surface.id + `{` +
    `width:var(--tilted-surface-width-` + surface.id + `) !important;` +
    `height:var(--tilted-surface-height-` + surface.id + `) !important;` +
    `position:relative !important;` +
    `will-change:top,left;` +
  `}` +

  `.tilted-scale-` + surface.id + `{   ` +
    `width:var(--tilted-surface-width-` + surface.id + `) !important;` +
    `height:var(--tilted-surface-height-` + surface.id + `) !important;` +
    `transition:transform var(--${nameOfProperty(surface.CONFIG, x => x.ANIMATION_SCALE_TIME)}) linear !important;` +
    `will-change:transform;` +
  `}` +

  `.tilted-position-` + surface.id + `{` +
    `width:var(--tilted-surface-width-` + surface.id + `) !important;` +
    `height:var(--tilted-surface-height-` + surface.id + `) !important;` +
    `position:relative !important;` +
    `top:0;` +
    `left:0;` +
    `will-change:transform;` +
  `}` +

  `.tilted-surface-` + surface.id + `{` +
    `position:relative !important;` +
    `overflow:visible !important;` +
    `z-index:100 !important;` +
  `}` +

  `.tilted-notransition-` + surface.id + `{` +
    `-webkit-transition:none !important;` +
    `-moz-transition:none !important;` +
    `-o-transition:none !important;` +
    `transition:none !important;` +
  `}`;

  return string;
}