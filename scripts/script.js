const Cell = function(selector) {
  this.element = selector;
  this.alive = false;
  this.highlighted = false;
}
Cell.prototype.updateDOM = function() {
  this.alive
    ? this.element.classList.add('alive')
    : this.element.classList.remove('alive');
  this.highlighted
    ? this.element.classList.add('highlight')
    : this.element.classList.remove('highlight');
}
Cell.prototype.die = function() {
  this.alive = false;
}
Cell.prototype.comeToLife = function() {
  this.alive = true;
}
Cell.prototype.toggleLife = function() {
  this.alive ? this.die() : this.comeToLife();
  this.updateDOM();
}
Cell.prototype.highlight = function() {
  this.highlighted = true;
  this.updateDOM();
}
Cell.prototype.unHighlight = function() {
  this.highlighted = false;
  this.updateDOM();
}

const game = {
  size: 50,
  tickRate: 0.25,
  tickDelta: 0.01,
  tickMin: 0.01,
  tickMax: 2,
  playing: false
};
game.init = function() {
  game.findBoard();
  game.generateBoard();
  game.setClick();
  game.setHover();
  game.setUniqueEvents();
}
game.findBoard = function() {
  game.board = document.getElementById('game-board');
}
game.mapCells = function(callback){
  for(let x = 0; x < game.size; x++){
    for(let y = 0; y < game.size; y++){
      callback(game.cells[x][y], x, y);
    }
  }
}
game.generateBoard = function() {
  game.cells = [];
  for(let x = 0; x < game.size; x++){
    const row = [];
    for(let y = 0; y < game.size; y++){
      const cell = document.createElement('li');
      cell.classList = 'tile'
      game.board.append(cell);
      const newCell = new Cell(cell);
      row.push(newCell);
    }
    game.cells.push(row);
  }
  game.board.style = `grid-template-columns: repeat(${game.size}, 1fr); grid-template-rows: repeat(${game.size}, 1fr);`
}
game.setClick = function() {
  game.mapCells(function(cell){
    cell.element.onclick = function(){
      cell.toggleLife();
    }
  });
}
game.setHover = function() {
  game.mapCells(function(cell){
    cell.element.onmouseover = function() {
      cell.highlight();
    }
    cell.element.onmouseout = function() {
      cell.unHighlight();
    }
  });
}
game.tick = function() {
  const steps = [];
  game.mapCells(function(cell, x, y) {
    let neighbourCount = 0;
    game.cells[x-1]
      ? game.cells[x-1][y-1]
        ? game.cells[x-1][y-1].alive ? neighbourCount++ : null
        : null
      : null;
    game.cells[x]
      ? game.cells[x][y-1]
        ? game.cells[x][y-1].alive ? neighbourCount++ : null
        : null
      : null;
    game.cells[x+1]
      ? game.cells[x+1][y-1]
        ? game.cells[x+1][y-1].alive ? neighbourCount++ : null
        : null
      : null;
    game.cells[x-1]
      ? game.cells[x-1][y]
        ? game.cells[x-1][y].alive ? neighbourCount++ : null
        : null
      : null;
    game.cells[x+1]
      ? game.cells[x+1][y]
        ? game.cells[x+1][y].alive ? neighbourCount++ : null
        : null
      : null;
    game.cells[x-1]
      ? game.cells[x-1][y+1]
        ? game.cells[x-1][y+1].alive ? neighbourCount++ : null 
        : null
      : null;
    game.cells[x]
      ? game.cells[x][y+1]
        ? game.cells[x][y+1].alive ? neighbourCount++ : null 
        : null
      : null;
    game.cells[x+1]
      ? game.cells[x+1][y+1]
        ? game.cells[x+1][y+1].alive ? neighbourCount++ : null 
        : null
      : null;
  /* 
    -For a space that is 'populated':-
    Each cell with one or no neighbors dies, as if by solitude. 
    Each cell with four or more neighbors dies, as if by overpopulation. 
    Each cell with two or three neighbors survives. 
    -For a space that is 'empty' or 'unpopulated'-
    Each cell with three neighbors becomes populated. 
    */
   let newStep = [];
    if(cell.alive){
      if(neighbourCount <= 1){
        newStep = [cell, cell.die];
      }else if(neighbourCount >= 4){
        newStep = [cell, cell.die];
      }
    }else{
      if(neighbourCount === 3){
        newStep = [cell, cell.comeToLife];
      }
    }
    newStep.length > 0 ? steps.push(newStep) : null;
  });
  steps.forEach((step) => {
    const toDo = step[1].bind(step[0]);
    toDo();
    step[0].updateDOM();
  })
}
game.clearBoard = function() {
  game.mapCells(function(cell){
    cell.die();
    cell.updateDOM();
  });
  game.pause();
}
game.play = function() {
  game.playing = true;
  game.ticker = setInterval(game.tick, game.tickRate * 1000);
  document.getElementById('play-pause').innerText = 'Pause';
}
game.pause = function() {
  game.playing = false;
  clearInterval(game.ticker);
  document.getElementById('play-pause').innerText = 'Play';
}
game.playPause = function() {
  game.playing ? game.pause() : game.play();
}
game.changeTickRate = function(amount) {
  game.pause();
  game.tickRate += amount;
  game.tickRate = Math.round(game.tickRate * 100)/100;
  document.getElementById('ticker').innerText = game.tickRate;
}
game.increaseTickRate = function() {
  if(game.tickRate < game.tickMax){
    game.changeTickRate(game.tickDelta);
  }
}
game.decreaseTickRate = function() {
  if(game.tickRate > game.tickMin){
    game.changeTickRate(-game.tickDelta);
  }
}
game.setUniqueEvents = function() {
  document.getElementById('play-pause').onclick = function() {
    game.playPause();
  }
  document.getElementById('clear-board').onclick = function() {
    game.clearBoard();
  }
  document.getElementById('ticker-increase').onclick = function() {
    game.increaseTickRate();
  }
  document.getElementById('ticker-decrease').onclick = function() {
    game.decreaseTickRate();
  }
}

window.onload = function(){
  game.init();
};