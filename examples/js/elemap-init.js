const elemap = new Elemap(
  typeof config !== 'undefined' ? config : {},
  typeof schema !== 'undefined' ? schema : {}
);

elemap.tileByIndex(1, 1).updateStyle({outer: 'background-color: red;'});
elemap.tileByIndex(1, 2).updateStyle({outer: 'background-color: green;'});
elemap.tileByIndex(2, 2).updateStyle({outer: 'background-color: blue;'});

elemap.render(document.getElementById('elemap-container'));