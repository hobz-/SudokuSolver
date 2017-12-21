var initializeApp = function (boardGrid) {
  boardGrid = [];
  generateBoard(9);
  $('#radioContainer').toggle();
  $('input[type=radio]').on('change', function() {
    $("#solvebtn").unbind('click');
    switch ($(this).attr('id')) {
      case 'BruteForceSolver':
        $("#solvebtn").click(function() {
          BruteForceSolver();
        });
        break;
      case 'AsyncBruteForceSolver':
        $("#solvebtn").click(function() {
          AsyncBruteForceSolver();
        });
        break;
      default:
        $("#solvebtn").click(function() {
          BruteForceSolver();
        });
        break;
    }
  });
}
var resetPage = function() {
  $("#board").empty();
  boardGrid = [];
  //toggle on the initial components rendered
  $('.title').toggle();
  $('#createsudoku').toggle();
  $('#randomsudoku').toggle();
  initializeApp();
}

var generateBoard = function(width) {
  // Initiates an empty board for the future jQuery to use

  var board = $("#board");

  for (var i = 0; i < width; i++) {
    var row = [];
    for (var j = 0; j < width; j++) {
      row.push('');
      board.append("<input class='gridCell' type='text' id="+i.toString()+j+" value='' />")
    }
    boardGrid.push(row);
    board.append("<br>");
  };

  // on change listener for the grid cells, which will updated the board state
  // in boardGrid
  $(".gridCell").change(function(e) {
    var ele = $(this);
    var id = $(ele).attr('id');
    var row = parseInt(id.substr(0,1), 10);
    var col = parseInt(id.substr(1), 10);

    boardGrid[row][col] = e.target.value;
  })
}

var onGridSubmit = function(req) {
  /* Function attached to the submit button of the page, which hides the submit
   * button, toggles on the solver buttons, and sets the user inputs to the
   * starting state of the board. The user inputs become 'readonly', so the
   * solver knows to avoid changing the numbers in these cells.
   */
  var submittedGrid = true;
  var board = $('#board');
  $(board).empty();

  if (req == "random") {
    var x = Math.floor((Math.random() * randomBoards.length));
    boardGrid = randomBoards[x];
  }
  //iterator to build the starting board.
  boardGrid.map((row, rowId) => {
    row.map((col, colId) => {
      var cellValue = col === '' ? '' : col;
      var readOnly = col === '' ? '' : 'readonly';
      board.append("<input class='gridCell' type='text' id="+rowId+colId+" value='"+cellValue+"' "+readOnly+" />")
    })
    board.append("<br>")
  });

  //toggle off the initial components rendered
  $('.title').toggle();
  $('#createsudoku').toggle();
  $('#randomsudoku').toggle();
  //toggle on the alogrithm radioboxes
  $('#radioContainer').toggle();

  $(".gridCell").change(function(e) {
    var ele = $(this);
    var id = $(ele).attr('id');
    var row = parseInt(id.substr(0,1), 10);
    var col = parseInt(id.substr(1), 10);

    boardGrid[row][col] = e.target.value;
  })
}

var AsyncBruteForceSolver = function() {
  // Asynchronous bruteforce solver. Same as the the funciton "BruteForceSolver",
  // only uses setTimeout to give the DOM time to update in-between iterations.
  var i = 0;
  var j = 0;
  var value = 1;
  var counter = 0;

  (function executeOneIteration() {
    if (j===9) {
      j=0;
      i++
    }

    if (checkReadOnly(i, j)) // If the cell is readonly, increment to the next
      j++
    else {
      if(checkValid(value, i, j, boardGrid)) {
         //if the number is valid, update the board state, and move to
         //the next cell
        changeNumber(value, i, j);
        value = 1;
        j++;
      } else {
        // else, if the number is 9 (the max), clear the current cell, and
        // back track
        if (value === 9) {
          changeNumber('', i, j);

          var backTrackReturn = backTrack(i, j);
          i = backTrackReturn[0];
          j = backTrackReturn[1];
          value = backTrackReturn[2];
        } else {
          // Else, we have room to increase the value further, and should
          // do so.
          value++;
        }
      }
    }
    counter++;

    if (i<=8 && counter < 1000000) {
      setTimeout(executeOneIteration, 0);
    }
  })();
}

var BruteForceSolver = function() {
  var i = 0;
  var j = 0;
  var value = 1;
  var counter = 0;
  console.log(boardGrid);

  while (i<=8 && counter < 1000000) {
    if (j===9) {
      j=0;
      i++
    }

    if (checkReadOnly(i, j))
      j++
    else {
      if(checkValid(value, i, j, boardGrid)) {
        changeNumber(value, i, j);
        value = 1;
        j++;
      } else {
        if (value === 9) {
          changeNumber('', i, j);

          var backTrackReturn = backTrack(i, j);
          i = backTrackReturn[0];
          j = backTrackReturn[1];
          value = backTrackReturn[2];
        } else {

          value++;
        }
      }
    }
    counter++;
  }
}

// Backtrack function which allows the algorithm to move backwards a cell,
// in case it reaches a cell where it cannot find a value that works.
var backTrack = function(i, j) {

  if (j === 0 && i !== 0) {
    i--;
    j = 8;
  } else {
    j--;
  }

  // if the new cell is read only back track again
  if (checkReadOnly(i, j)) {
    return backTrack(i, j);
  }

  var value = parseInt($('.gridCell#' + i.toString() + j).val(), 10);

  //If the last cell value is at 9, clear it and back track again
  if (value === 9) {
    changeNumber('', i, j);
    return backTrack(i, j);
  } else
    value++;

  return [i, j, value];
}

var checkReadOnly = function(row, col) {
  var id = row.toString() + col;
  var ele = $(".gridCell#" + id);
  if ($(ele).attr('readonly'))
    return true;

  return false;
}

//Function used by the iterator to change the value of a cell in the browser
var changeNumber = function(value, row, col) {
  var id = row.toString() + col;
  var ele = $(".gridCell#" + id);
  $(ele).val(value);
  $(ele).trigger("change");
}

//Checks all three requirements for a cell, horizontal, vertical and 'box',
//to see if the cell number is valid (ie meets the 1-9 requirements for each)
var checkValid = function(value, row, col, grid) {
  return (checkHorizontal(value, row, col, grid) &&
          checkVertical(value, row, col, grid) &&
          checkBox(value, row, col, grid))
}

var checkHorizontal = function(value, row, col, grid) {
  for (var j = 0; j < grid.length; j++) {
    if (j === col)
      continue;

    if (parseInt(value, 10) === parseInt(grid[row][j], 10)) {
      return false;
    }
  }

  return true;
}

var checkVertical = function(value, row, col, grid) {
  for (var i = 0; i < grid.length; i++) {
    if (i === row)
      continue;

      if (parseInt(value, 10) === parseInt(grid[i][col], 10)) {
        return false;
      }
  }

  return true;
}

var checkBox = function(value, row, col, grid) {
  var rowRange = findBoxRange(row, 3);
  var colRange = findBoxRange(col, 3);

  for (var i = 0; i < rowRange.length; i++)  {
    for (var j = 0; j < colRange.length; j++) {
      if (rowRange[i] === row && colRange[j] === col) {
        continue;
      }

      if (parseInt(grid[rowRange[i]][colRange[j]], 10) === value) {
        return false;
      }
    }
  }

  return true;
}

//function used to determine what 'box group' a given cell is in.
//ie: Top Left, Top Center, Top Right, etc.
var findBoxRange = function(n, factor) {
  var remainder = n % factor;
  var min = (n - remainder);
  var range = [];

  for (var i = 0; i < factor; i++) {
    range.push(min + i);
  }

  return range;
}

var boardGrid = [];
initializeApp(boardGrid);

var submittedGrid = false;
var randomBoards = [
                   [['','','',3,4,'','','',''],
                    [6,'','','','',1,'',4,''],
                    [7,'',4,'','',5,1,'',''],
                    [8,'','','',6,'','',1,5],
                    ['',2,'','','','',4,'',7],
                    [5,'','','','','','','',3],
                    ['','','',9,'','','','',''],
                    ['','',7,'',5,3,'','',''],
                    ['','','',4,1,'',5,2,'']]
                   ,
                   [[7,9,'','','','',3,'',''],
                    ['','','','','',6,9,'',''],
                    [8,'','','',3,'','',7,6],
                    ['','','','','',5,'','',2],
                    ['','',5,4,1,8,7,'',''],
                    [4,'','',7,'','','','',''],
                    [6,1,'','',9,'','','',8],
                    ['','',2,3,'','','','',''],
                    ['','',9,'','','','',5,4]]
                   ,
                   [[5,3,'','',7,'','','',''],
                    [6,'','',1,9,5,'','',''],
                    ['',9,8,'','','','',6,''],
                    [8,'','','',6,'','','',3],
                    [4,'','',8,'',3,'','',1],
                    [7,'','','',2,'','','',6],
                    ['',6,'','','','',2,8,''],
                    ['','','',4,1,9,'','',5],
                    ['','','','',8,'','',7,9]]
                   ,
                   [[4,'',1,2,9,'','',7,5],
                    [2,'','',3,'','',8,'',''],
                    ['',7,'','',8,'','','',6],
                    ['','','',1,'',3,'',6,2],
                    [1,'',5,'','','',4,'',3],
                    [7,3,'',6,'',8,'','',''],
                    [6,'','','',2,'','',3,''],
                    ['','',7,'','',1,'','',4],
                    [8,9,'','',6,5,1,'',7]]
                   ,
                   [['','','','','','','','',''],
                    ['','',7,1,'',3,9,'',''],
                    ['',9,3,'',7,'',6,8,''],
                    ['',2,'',3,4,8,'',6,''],
                    ['',3,8,'',1,'',2,4,''],
                    ['','',9,2,'',7,3,'',''],
                    ['','',5,6,3,1,7,'',''],
                    ['','','',4,8,5,'','',''],
                    ['','','','',9,'','','','']]
                   ,
                   [['','','','',5,'','','',''],
                    [9,'',6,'','','',3,'',7],
                    ['','','',4,'',9,'','',''],
                    ['',1,'','','','','',5,''],
                    [2,'','',6,'',7,'','',1],
                    ['',4,'','','','','',9,''],
                    ['','','',7,'',1,'','',''],
                    [7,'',9,'','','',2,'',6],
                    ['','','','',3,'','','','']]
                   ,
                   [['','','','','','','','',''],
                    ['',9,3,6,2,8,1,4,''],
                    ['',6,'','','','','',5,''],
                    ['',3,'','',1,'','',9,''],
                    ['',5,'',8,'',2,'',7,''],
                    ['',4,'','',7,'','',6,''],
                    ['',8,'','','','','',3,''],
                    ['',1,7,5,9,3,4,2,''],
                    ['','','','','','','','','']]
                   ,
                   [[6,'','',1,4,3,9,'',''],
                    ['','',4,'','','','',6,''],
                    ['',3,9,'',5,'','','',''],
                    ['',5,'',2,'',4,'','',''],
                    ['','',6,'','','',4,'',''],
                    ['','','',9,'',7,'',8,''],
                    ['','','','',8,'',3,5,''],
                    ['',8,'','','','',2,'',''],
                    ['','',5,6,7,2,'','',4]]
                   ,
                   [['','','',2,1,'','','',''],
                    ['','',7,3,'','','','',''],
                    ['',5,8,'','','','','',''],
                    [4,3,'','','','','','',''],
                    [2,'','','','','','','',8],
                    ['','','','','','','',7,6],
                    ['','','','','','',2,5,''],
                    ['','','','','',7,3,'',''],
                    ['','','','',9,8,'','','']]
                   ]
