var Viewer = {
  results: results, teamColors: teamColors, downloadTime: downloadTime,
  categories: 'FfMm',
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
      categories = g.categories;
  for (var i = 0; i < categories.length; ++i) {
    var category = categories[i];
    if (arg.indexOf(category) == -1) {
      var button = g.buttons[category];
      button.active = false;
      g.classAdd(button, 'disabled');
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
  g.setPermalink();
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

Viewer.reportTime = function () {
  var g = Viewer,
      container = document.getElementById('time'),
      months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      date = new Date();
  date.setTime(g.downloadTime);
  var h = date.getHours(), m = date.getMinutes(), s = date.getSeconds(),
      day = date.getDay(), month = months[date.getMonth()],
      dateParts = [], pm = false;
  if (h == 0) {
    dateParts.push('12');
  } else {
    if (h >= 12) {
      pm = true;
      if (h > 12) {
        h -= 12;
      }
    }
    dateParts.push(''+h);
  }
  dateParts.push(':' + (m < 10 ? '0' : '') + m);
  dateParts.push(':' + (s < 10 ? '0' : '') + s);
  dateParts.push(' ' + (pm ? 'pm' : 'am'));
  dateParts.push(' on ' + month + ' ' + day);
  var dateString = dateParts.join('');
  container.innerHTML = 'The results below were obtained from' +
      ' the <a target="_blank" href="http://c2ctc.com/">CTC website</a>' +
      ' at ' + dateString + '.';
};

Viewer.setPermalink = function () {
  var g = Viewer,
      parts = [];
  for (var i = 0; i < g.categories.length; ++i) {
    if (g.buttons[g.categories[i]].active) {
      parts.push(g.categories[i]);
    }
  }
  var query = '?only='+parts.join(''),
      url = document.URL,
      pos = url.indexOf('?');
  if (pos != -1) {
    url = url.substring(0, pos);
  }
  g.permalink = url + query;
};

Viewer.makePermalinkButton = function () {
  var g = Viewer,
      container = document.getElementById('permalink'),
      categories = g.categories,
      button = g.makeElement('div', 'permalink', 'button'),
      link = g.makeElement('span', '', 'permalink');
  g.makeUnselectable(button);
  button.onmouseover = function () {
    link.innerHTML = g.permalink;
    link.style.visibility = 'visible';
  };
  button.onmouseout = function () {
    link.style.visibility = 'hidden';
  };
  button.onmousedown = function () {
    window.location = g.permalink;
  };
  container.appendChild(button);
  container.appendChild(link);
};

Viewer.load = function () {
  var g = Viewer;
  g.makeButtons();
  g.parseQuery();
  g.makeChart();
  g.reportTime();
  g.makePermalinkButton();
};

window.onload = Viewer.load;
