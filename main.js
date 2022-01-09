import { randomLetter } from './random-letter.js';

const $ = selector => document.querySelector(selector);

const ROWS_COUNT = 4;
const COLS_COUNT = 4;

function randomGrid() {
  const grid = [];
  for (let r = 0; r < ROWS_COUNT; r++) {
    const row = [];
    grid.push(row);
    for (let c = 0; c < COLS_COUNT; c++) {
      row.push(randomLetter());
    }
  }
  console.log(JSON.stringify(grid));
  return grid;
}


function showGrid(grid) {
  const gridElement = $('table#grid');
  let html = '';
  for (let [r, row] of grid.entries()) {
    html += `<tr>`;
    for (let [c, item] of row.entries()) {
      html += `<td id="${getCellId(r, c)}">${item}</td>`;
    }
    html += `</tr>`;
  }
  gridElement.innerHTML = html;
}

function getCell(r, c) {
  return $('#' + getCellId(r, c));
}

function getCellId(r, c) {
  return `cell-${r}-${c}`;
}

// type PathItem = { r, c, letter }
// type Path = PathItem[]
// type Paths = Path[] = PathItem[][]
function getPaths(grid, word, prefixPath) {
  prefixPath = prefixPath || [];

  if (word === '') { // base case
    return [prefixPath];
  }

  const firstLetter = word[0];
  const restOfWord = word.slice(1);

  function positionToPathItem(position) {
    const { r, c } = position;
    return {
      r,
      c,
      letter: grid[r][c],
    };
  }

  let neighbors;
  if (prefixPath.length) {
    const previous = prefixPath.slice(-1)[0];
    neighbors = [...getNeighbors(previous.r, previous.c)]
      .map(pos => positionToPathItem(pos))
      .filter(
        // "not already in prefixPath"
        ({r, c}) => -1 === prefixPath.findIndex(prefixItem => prefixItem.r === r && prefixItem.c === c)
      );
  } else {
    neighbors = [...allCoordinates()]
      .map(pos => positionToPathItem(pos));
  }

  const correctNeighbors = neighbors
    .filter(neighbor => neighbor.letter === firstLetter);

  let result = [];
  for (let neighbor of correctNeighbors) {
    const subproblem = getPaths(
        grid,
        restOfWord,
        prefixPath.concat([neighbor])
      )
    result = result.concat(
      subproblem
        // .map(restPath => [neighbor].concat(restPath))
    );
  }
  return result;
}

window.getPaths = getPaths;

function* getNeighbors(centerR, centerC) {
  for (let rOffset = -1; rOffset <= 1; rOffset++) {
    for (let cOffset = -1; cOffset <= 1; cOffset++) {
      const r = centerR + rOffset;
      const c = centerC + cOffset;
      if (
        0 <= r && r < ROWS_COUNT &&
        0 <= c && c < COLS_COUNT &&
        !(rOffset === 0 && cOffset === 0)
      ) {
        yield { r, c };
      }
    }
  }
}
function* allCoordinates() {
  for (let r = 0; r < ROWS_COUNT; r++) {
    for (let c = 0; c < COLS_COUNT; c++) {
      yield { r, c };
    }
  }
}

let grid = [["N","I","U","S"],["E","T","H","L"],["L","R","D","E"],["O","L","G","A"]];
// 5: shut tine lead roll age
// 4: aged lush tine roll

grid = [["I","S","O","E"],["N","A","O","M"],["G","N","O","E"],["E","T","E","C"]];
// 5: insane soon note gnome cee

grid = [["N","D","E","P"],["I","H","N","I"],["P","W","M","E"],["O","A","N","D"]];
// this one is really hard!!

grid = [["E","S","I","N"],["T","O","G","C"],["B","A","O","K"],["E","T","V","N"]];
// 6: BEAT 1 TOES VOTE KNOT NOCK SING
// 5: VOTE NOCK BOAT 0 GOES IN

grid = [Array.from("AITS"),
Array.from("BTNL"),
Array.from("EGAV"),
Array.from("RRIY")]



// // 5x5s
//
// grid = [["R","N","E","O","E"],["G","H","I","S","C"],["T","S","E","N","E"],["S","W","S","A","C"],["I","T","C","K","S"]]
// // 8 ish (r is disconnected i think) SCENES 4 SACKS 3 WITS 0 SINGS THE 0 SINCE 0 SO
//
// grid = [["D","R","N","D","I"],["G","H","W","H","E"],["A","S","E","O","A"],["H","U","T","S","T"],["E","D","S","O","N"]];
// // impossible? consonant cluster in the corner top left

grid = randomGrid();




window.grid = grid;


function keydown(inputElement) {
  if (event.key !== 'Enter') {
    return;
  }

  let word = inputElement.value.trim().toUpperCase();
  if (word === '-') {
    document.querySelectorAll('td').forEach(td => td.style.opacity = '1');
    const ol = $('ol#words');
    ol.innerHTML = '';
    inputElement.value = '';
  } else {
    guess(word, inputElement);
  }
}

function guess(word, inputElement) {
  word = word.toUpperCase();
  if (!word) {
    return;
  }

  let pathIndex = undefined;
  if (word.includes(' ')) {
    [word, pathIndex] = word.split(' ');
    pathIndex = +pathIndex;
  }

  if (!window.words.has(word.toLowerCase())) {
    console.log(`${word} is not a word.`);
    inputElement.value = '';
    return;
  }

  const paths = getPaths(grid, word);

  if (paths.length === 0) {
    console.log(`${word} not found.`);
    inputElement.value = '';
  } else if (paths.length > 1 && pathIndex === undefined) {
    console.log(`${word} can be spelled in ${paths.length} different ways. Please disambiguate.`);
    for (let [n, path] of paths.entries()) {
      showPathAscii(path, n);
    }
  } else {
    const ol = $('ol#words');
    ol.innerHTML += `<li>${word} ${pathIndex ?? ''}</li>`;
    const path = paths[pathIndex || 0];
    for (let {r, c} of path) {
      getCell(r, c).style.opacity = '0.5';
    }
    inputElement.value = '';
  }
}
window.keydown = keydown;

function showPathAscii(path, label) {
  const grid = [];
  for (let r = 0; r < ROWS_COUNT; r++) {
    const row = [];
    grid.push(row);
    for (let c = 0; c < COLS_COUNT; c++) {
      let gridItem = '.';
      const pathItem = path.find(prefixItem => prefixItem.r === r && prefixItem.c === c);  // TODO DRY this with findIndex above
      if (undefined !== pathItem) {
        gridItem = pathItem.letter;
      }
      row.push(gridItem);
    }
  }
  let result = label + ':\n';
  for (let row of grid) {
    result += '  ';
    for (let item of row) {
      result += item + ' ';
    }
    result += '\n';
  }
  console.log(result);
}

showGrid(grid);

function randomWord() {
  return wordsArray[Math.floor(Math.random() * wordsArray.length)];
}

(async () => {
  const text = await fetch('./sowpods.txt').then(response => response.text());
  const wordsArray = text
    .split('\n')
    .filter(word => word !== '' && !word.startsWith('#'));
  window.wordsArray = wordsArray;
  // console.log(wordsArray[0]);
  // console.log(wordsArray.at(-1));
  const words = new Set(wordsArray);
  // console.log(words.size);
  window.words = words;
  $('input#my-input').disabled = false;
  $('input#my-input').focus();
})();

window.guess = guess;
window.randomWord = randomWord;
