/**
 * @event
 * @description Loads analytics page depending on whether any tasks have been completed
 */
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('comp-tasks-dropdown').selectedIndex = -1;
  document
    .getElementById('comp-tasks-dropdown')
    .addEventListener('change', (event) => {
      displayAnalytics(false);
    });
});

/**
 * @method loadAnalytics
 * @description Creates drop-down on analytics page for tasks
 */
function loadAnalytics() {
  document.getElementById('no-tasks').style.display = 'block';
  document.getElementById('task-select').style.display = 'none';
  document.getElementById('comp-tasks-dropdown').innerHTML = '';
  document.getElementById('stat-display').innerHTML = '';

  let emptySelection = document.createElement('option');
  emptySelection.selected = true;
  emptySelection.disabled = true;
  emptySelection.innerText = '-- select an option --';

  document.getElementById('comp-tasks-dropdown').appendChild(emptySelection);
  let tasks = JSON.parse(localStorage.getItem('finished-tasks'));
  if (tasks && Object.keys(tasks) && Object.keys(tasks).length !== 0) {
    let dropdown = document.getElementById('comp-tasks-dropdown');
    for (let i = 0; i < Object.keys(tasks).length; i++) {
      let selection = document.createElement('option');
      selection.setAttribute('value', Object.keys(tasks)[i]);
      selection.innerHTML = tasks[Object.keys(tasks)[i]][0];
      dropdown.appendChild(selection);
    }
    document.getElementById('no-tasks').style.display = 'none';
    document.getElementById('task-select').style.display = 'initial';
  }
}

/**
 * @method createSampleAnalytics
 * @description Adds sample analytics
 */
function createSampleAnalytics() {
  document.getElementById('comp-tasks-dropdown').value = "SAMPLE ANALYTICS";
  displayAnalytics(true);
  document.getElementById('no-tasks').style.display = 'none';
  document.getElementById('task-select').style.display = 'initial';
}

/**
 * @method displayAnalytics
 * @description Displays analytics for selected task
 * @param {Boolean} isSample
 */
function displayAnalytics(isSample) {
  document.getElementById('stat-display').innerHTML = '';
  let taskID = document.getElementById('comp-tasks-dropdown').value;
  let tasks = JSON.parse(localStorage.getItem('finished-tasks'));
  let taskProgress
  let distractions
  let totalTime
  let cancelledWorkPomos = 0
  if (isSample) {
    taskProgress = [["wc",181],["w",1500],["sb",300],["w",1200],["sbc",100],["sb",180],["w",1200],["sb",120],["wc",60],["w",1500],["lb",900],["w",1800]];
    distractions = [170,1012,2003,7817]
    totalTime = 8991
  } else{
    taskProgress = tasks[taskID][4];
    distractions = tasks[taskID][3];
    totalTime = tasks[taskID][5];
  }
  cancelledWorkPomos = 0;
  let board = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  board.setAttribute('width', '1000');
  board.setAttribute('height', '200');
  board.setAttribute('id', 'analytics-svg');
  let xtrack = 0;
  document.getElementById('stat-display').appendChild(board);
  for (let i = 0; i < taskProgress.length; i++) {
    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute(
      'width',
      String(Math.round((1000 * taskProgress[i][1]) / totalTime))
    );
    rect.setAttribute('height', '100');
    rect.setAttribute('x', String(xtrack));
    rect.setAttribute('y', '20');
    rect.setAttribute('id', 'progress-rect-' + String(i)); // for testing
    xtrack += Math.round((1000 * taskProgress[i][1]) / totalTime);

    let pomoType;
    switch (taskProgress[i][0]) {
      case 'w':
        pomoType = 'Work Pomo';
        rect.setAttribute('class', 'wRect');
        break;
      case 'sb':
        pomoType = 'Short Break';
        rect.setAttribute('class', 'sbRect');
        break;
      case 'lb':
        pomoType = 'Long Break';
        rect.setAttribute('class', 'lbRect');
        break;
      case 'wc':
        pomoType = 'Cancelled Work Pomo';
        rect.setAttribute('class', 'cRect');
        cancelledWorkPomos++;
        break;
      case 'sbc':
        pomoType = 'Cancelled Short Break';
        rect.setAttribute('class', 'cRect');
        break;
      case 'lbc':
        pomoType = 'Cancelled Long Break';
        rect.setAttribute('class', 'cRect');
        break;
    }

    let labelText =
      'This was a ' +
      pomoType +
      ' that lasted ' +
      Math.floor(taskProgress[i][1] / 60) +
      ' minutes and ' +
      (taskProgress[i][1] % 60) +
      ' seconds.';
    rect.setAttribute('onmouseover', 'setLabel("' + labelText + '")');
    rect.setAttribute('onmouseout', 'setLabel("Hover to Display Info")');

    board.appendChild(rect);
  }

  for (let i = 0; i < distractions.length; i++) {
    let rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', 5);
    rect.setAttribute('height', '110');
    rect.setAttribute(
      'x',
      String(Math.round((1000 * distractions[i]) / totalTime))
    );
    rect.setAttribute('y', '15');
    rect.setAttribute('fill', 'rgba(255,0,0,0.8)');
    rect.setAttribute('id', 'dist-rect-' + String(i));

    let labelText =
      'This was a distraction logged at ' +
      Math.floor(distractions[i] / 60) +
      ' minutes and ' +
      (distractions[i] % 60) +
      ' seconds in.';

    rect.setAttribute('onmouseover', 'setLabel("' + labelText + '")');
    rect.setAttribute('onmouseout', 'setLabel("Hover to Display Info")');
    board.appendChild(rect);
  }

  let label = document.createElement('h2');
  label.setAttribute('id', 'svg-label');
  label.innerHTML = 'Hover to Display Info';
  document.getElementById('stat-display').appendChild(label);

  let stats = document.createElement('div');
  stats.setAttribute('id', 'stats');

  let statEstPomo = document.createElement('p');
  if (isSample) {
    statEstPomo.innerHTML = 'Estimated Work Pomos: 10<br>';
  } else {
    statEstPomo.innerHTML = 'Estimated Work Pomos: ' + tasks[taskID][1] + '<br>';
  }
  statEstPomo.setAttribute('id', 'stat-est-pomo');
  stats.appendChild(statEstPomo);

  let statActPomo = document.createElement('p');
  if (isSample) {
    statActPomo.innerHTML = 'Completed Work Pomos: 5';
  } else {
    statActPomo.innerHTML = 'Completed Work Pomos: ' + tasks[taskID][2];
  }
  statActPomo.setAttribute('id', 'stat-act-pomo');
  stats.appendChild(statActPomo);

  let statDistractions = document.createElement('p');
  statDistractions.innerHTML = 'Distractions Logged: ' + distractions.length;
  statDistractions.setAttribute('id', 'stat-distractions');
  stats.appendChild(statDistractions);

  let statCancelledPomo = document.createElement('p');
  statCancelledPomo.innerHTML = 'Cancelled Work Pomos: ' + cancelledWorkPomos;
  statCancelledPomo.setAttribute('id', 'stat-cancelled-pomo');
  stats.appendChild(statCancelledPomo);

  let statTotalTime = document.createElement('h3');
  statTotalTime.innerHTML =
    'Total Time: ' +
    Math.floor(totalTime / 60) +
    ' minutes and ' +
    (totalTime % 60) +
    ' seconds.';
  stats.appendChild(statTotalTime);

  document.getElementById('stat-display').appendChild(stats);
}

/**
 * @method setLabel
 * @description Sets text inside hover label
 * @param {String} text
 */
function setLabel(text) {
  document.getElementById('svg-label').innerHTML = text;
}
