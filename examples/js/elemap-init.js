const elemap = new Elemap(
  typeof config !== 'undefined' ? config : {},
  typeof style !== 'undefined' ? style : {}
);
elemap.grid.tileByIndex(1, 1).setProp('outer', 'regular', 'background', {color:'red'});
elemap.grid.tileByIndex(1, 2).setProp('outer', 'regular', 'background', {color:'green'});
elemap.grid.tileByIndex(2, 2).setProp('outer', 'regular', 'background', {color:'blue'});
elemap.render(document.getElementById('elemap-container'));