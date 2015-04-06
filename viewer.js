var Viewer = {
  results: results, teamColors: teamColors,
  buttonInfo: [
    { category: 'F', longName: 'heavyweight female' },
    { category: 'f', longName: 'lightweight female' },
    { category: 'M', longName: 'heavyweight male' },
    { category: 'm', longName: 'lightweight male' }
  ]
};

Viewer.makeElement = function (tag, innerHTML, className) {
  var element = document.createElement(tag);
  if (innerHTML !== undefined) {
    element.innerHTML = innerHTML;
  }
  if (className !== undefined) {
    element.className = className;
  }
  return element;
};

Viewer.classAdd = function (element, name) {
  if (!element.className) {
    element.className = name;
  } else {
    element.className += ' '+name;
  }
};
Viewer.classRemove = function (element, name) {
  if (!element.className) {
    return;
  }
  var names = element.className.split(/\s+/),
      newClasses = [];
  for (var i = 0; i < names.length; ++i) {
    if (names[i] !== name) {
      newClasses.push(names[i]);
    }
  }
  element.className = newClasses.join(' ');
};
Viewer.classIncludes = function (element, name) {
  if (!element.className) {
    return false;
  }
  var names = element.className.split(/\s+/);
  for (var i = 0; i < names.length; ++i) {
    if (names[i] == name) {
      return true;
    }
  }
  return false;
};

Viewer.makeUnselectable = function (element) {
  var g = Viewer;
  g.classAdd(element, 'unselectable');
  element.ondragstart = function (event) {
    event.preventDefault();
  };
  element.onselectstart = function (event) {
    event.preventDefault();
  };
};

Viewer.downButton = function () {
  var g = Viewer,
      button = this;
  if (button.active) {
    g.classAdd(button, 'disabled');
    button.active = false;
  } else {
    g.classRemove(button, 'disabled');
    button.active = true;
  }
  g.makeChart();
};

Viewer.makeButtons = function () {
  var g = Viewer,
      buttons = g.buttons = {},
      container = document.getElementById('buttons'),
      buttonInfo = g.buttonInfo;
  for (var i = 0; i < buttonInfo.length; ++i) {
    if (i == 2) {
      container.appendChild(g.makeElement('br'));
    }
    var info = buttonInfo[i],
        category = info.category,
        button = g.makeElement('div'),
        categorySpan = g.makeElement('div', category, 'category');
    buttons[category] = button;
    button.active = true;
    button.className = 'button ' +
        (category.toLowerCase() == 'f' ? 'fe' : '')+'male';
    button.appendChild(categorySpan);
    button.onmousedown = g.downButton;
    g.makeUnselectable(button);
    container.appendChild(button);
  }
};

Viewer.parseQuery = function () {
  var g = Viewer,
      url = document.URL,
      pos = url.indexOf('?');
  if (pos == -1) {
    return;
  }
  var query = url.substring(pos+1),
      parts = query.split('=');
  if (parts.length != 2 || parts[0] != 'only') {
    return;
  }
  var arg = parts[1],
      categories = 'FfMm';
  for (var i = 0; i < categories.length; ++i) {
    var category = categories[i];
    if (arg.indexOf(category) == -1) {
      var button = g.buttons[category];
      button.active = false;
      g.classAdd(button, 'disabled');
      console.log('disabled '+category);
    }
  }
};

Viewer.makeChart = function () {
  var g = Viewer,
      buttons = g.buttons,
      results = g.results,
      container = document.getElementById('ranking'),
      table = document.createElement('table'),
      tbody = document.createElement('tbody'),
      tr = document.createElement('tr');
  if (container.table !== undefined) {
    container.removeChild(container.table);
  }
  container.table = table;
  tr.className = 'header';
  tr.appendChild(g.makeElement('td', 'rank'));
  tr.appendChild(g.makeElement('td', 'name'));
  tr.appendChild(g.makeElement('td', 'category'));
  tr.appendChild(g.makeElement('td', 'boat'));
  tr.appendChild(g.makeElement('td', 'result'));
  tr.appendChild(g.makeElement('td', 'pace'));
  tr.appendChild(g.makeElement('td', 'power'));
  tbody.appendChild(tr);
  var rankFiltered = 0;
  for (var i = 0; i < results.length; ++i) {
    var result = results[i];
    if (!buttons[result.category].active) {
      continue;
    }
    ++rankFiltered;
    var tr = document.createElement('tr');
    if (rankFiltered % 2 == 0) {
      tr.className = 'even';
    }
    tr.appendChild(g.makeElement('td', ''+rankFiltered, 'rank filtered'));
    tr.appendChild(g.makeElement('td', result.name));
    var category = result.category,
        modifier = (category.toUpperCase() == category ? 'heavy' : 'light');
    tr.appendChild(g.makeElement('td', category, modifier+'weight'));
    var boat = result.team+' '+result.boat_number,
        color = teamColors[result.team],
        td = g.makeElement('td', boat, 'boat');
    td.style.backgroundColor = '#'+color;
    tr.appendChild(td);
    tr.appendChild(g.makeElement('td', result.result, 'data'));
    tr.appendChild(g.makeElement('td', result.pace, 'data'));
    tr.appendChild(g.makeElement('td', result.power, 'data'));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  container.appendChild(table);
};

Viewer.load = function () {
  var g = Viewer;
  g.makeButtons();
  g.parseQuery();
  g.makeChart();
};

window.onload = Viewer.load;
