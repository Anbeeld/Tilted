import Surface from '../surface.js';

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

export function cssCore(surface: Surface) {
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
  `.tilted-${surface.id}-container{` +
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

  `.tilted-${surface.id}-container:active{` +
    `cursor:grabbing;` +
    `cursor:-moz-grabbing;` +
    `cursor:-webkit-grabbing;` +
  `}` +
  
  `.tilted-${surface.id}-controls{` +
    `position:absolute;` +
    `top:100px;` +
    `right:30px;` +
    `width:30px;` +
    `border-radius:8px;` +
    `box-shadow:rgba(0, 0, 0, 0.16) 0px 1px 4px;` +
    `box-sizing:content-box;` +
    `overflow:hidden;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in,` +
  `.tilted-${surface.id}-controls-zoom-out{` +
    `position:relative;` +
    `width:30px;` +
    `height:30px;` +
    `background:#ffffffcc;` +
    `cursor:pointer;` +
    `box-sizing:content-box;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in{` +
    `border-bottom:1px solid #444444;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in:active,` +
  `.tilted-${surface.id}-controls-zoom-out:active{` +
    `background:#ffffff;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in:before,` +
  `.tilted-${surface.id}-controls-zoom-in:after,` +
  `.tilted-${surface.id}-controls-zoom-out:before{` +
    `content:"";` +
    `display:block;` +
    `position:absolute;` +
    `background:#444444;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in:before,` +
  `.tilted-${surface.id}-controls-zoom-out:before{` +
    `height:2px;` +
    `width:18px;` +
    `top:14px;` +
    `left:6px;` +
  `}` +

  `.tilted-${surface.id}-controls-zoom-in:after{` +
    `height:18px;` +
    `width:2px;` +
    `top:6px;` +
    `left:14px;` +
  `}` +

  `.tilted-${surface.id}-viewport{` +
    `width:var(--tilted-` + surface.id + `-surface-width) !important;` +
    `height:var(--tilted-` + surface.id + `-surface-height) !important;` +
    `position:relative !important;` +
    `will-change:top,left;` +
  `}` +

  `.tilted-${surface.id}-transform{` +
    `width:var(--tilted-` + surface.id + `-surface-width) !important;` +
    `height:var(--tilted-` + surface.id + `-surface-height) !important;` +
    `will-change:transform;` +
  `}` +

  `.tilted-${surface.id}-surface{` +
    `position:relative !important;` +
    `overflow:visible !important;` +
    `z-index:100 !important;` +
  `}` +

  `.tilted-${surface.id}-scene>*:not(.tilted-${surface.id}-figure),` +
  `.tilted-${surface.id}-figure{` +
    `transform-origin:bottom;` +
  `}` +
  `.tilted-${surface.id}-preserve-3d{` +
    `transform-style:preserve-3d;` +
  `}`;

  return string;
}