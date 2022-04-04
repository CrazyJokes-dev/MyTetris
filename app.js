document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  let squares = Array.from(document.querySelectorAll('.grid div'))
  const scoreDisplay = document.querySelector('#score')
  const startBtn = document.querySelector('#start-button')
  const width = 10
  let nextRandom = 0
  let timerId
  let score = 0

  //The Tetrominoes
  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ]

  const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
  ]

  const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
  ]

  const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
  ]

  const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
  ]

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

  let currentPosition = 4
  let currentRotation = 0

  //randomly select a Tetromino and its first rotation
  let random = Math.floor(Math.random()*theTetrominoes.length)
  let current = theTetrominoes[random][currentRotation]

  //draw the Tetromino
  function draw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.add('tetromino')
    })
  }

  function undraw() {
    current.forEach(index => {
      squares[currentPosition + index].classList.remove('tetromino')
    })
  }

  //make the tetromino move down every second
  //timerId = setInterval(moveDown, 500)

  //assign functions to keyCodes
  function control(e) {
    if(e.keyCode === 37) {  //Left Arrow
      moveLeft()
    } else if(e.keyCode === 38) {  //Up Arrow
      rotate()
    }  else if(e.keyCode === 39) {  // Right Arrow
      moveRight()
    } else if (e.keyCode === 40) {  //Down Arrow
      moveDown()
    } else if (e.keyCode === 66) {  //Spacebar
      StoreTetromino()
    } 
    
  }
  document.addEventListener('keyup', control)

  function moveDown() {
    undraw()
    currentPosition += width
    draw()
    freeze()
  }

  //freeze the tetromino when it hits the bottom
  function freeze() {
    if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => squares[currentPosition + index].classList.add('taken'))
      //start a new tetromino
      random = nextRandom
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      current = theTetrominoes[random][currentRotation]
      currentPosition = 4
      draw()
      displayShape()
      addScore()
      gameOver()
    }
  }

  //move the tetromino left, unless at an edge or blockage
  function moveLeft() {
    undraw()
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)

    if(!isAtLeftEdge) currentPosition -=1

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition += 1
    }

    draw()
  }

  //move the tetromino right, unless at edge or blockage
  function moveRight() {
    undraw()
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)

    if(!isAtRightEdge) currentPosition += 1

    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      currentPosition -= 1
    }

    draw()
  }

  //rotate the tetromino in a new position
  function rotate() {
    undraw()
    currentRotation++
    if(currentRotation === current.length) {
      currentRotation = 0;
    }
    current = theTetrominoes[random][currentRotation]
    draw()
  }


  //show up-next tetromino in mini-grid ScoreDisplay
  const displaySquares = document.querySelectorAll('.mini-grid div')
  const displayWidth = 4
  let displayIndex = 0


  //the tetromino without rotations
  const upNextTetrominoes = [
    [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
    [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
    [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
    [0, 1, displayWidth, displayWidth+1], //oTetromino
    [1, displayWidth+1, displayWidth*2+1, displayIndex*3+1] //iTetromino
  ]

  //display the shape in the mini-grid display
  function displayShape() {
    //remove any trace of a tetromino from the entire grid
    displaySquares.forEach(square => {
      square.classList.remove('tetromino')
    })
    upNextTetrominoes[nextRandom].forEach(index => {
      displaySquares[displayIndex + index].classList.add('tetromino')
    })
  }

  //show the stored tetromino in the storage
  const displayStorage = document.querySelectorAll('.storage div')
  let isStorageFull = false
  let storedTetromino = 0 //l->0, z->1, t->2, o->3, i->4

  /**
   * if there IS NOT a shape stored
   *    store currently falling shape
   *    set 'isStorageFull' to true
   *    remove the shapes displayed in the main grid
   *    display the corresponding stored shape from upNextTetromino to main grid
   *    set the upNextTetromino in mini-grid and display mini-grid shape to main grid
   * ELSE
   *    Remove the currently falling shape in main grid
   *    Remove the previously stored shape in '.storage div'
   *    Display the currently falling shape in '.storage div'
   *    Display the shape that was stored in the spot where it was falling
   *    Store the shape currently falling
   *    don't touch the tetromino in mini-grid
   */
  function StoreTetromino() {
    if (!isStorageFull) {
      //random only changes when the current shape touches bottom or another shape,
      //so random contains the currently falling shape
      storedTetromino = random
      isStorageFull = true
      upNextTetrominoes[random].forEach(index => {
      displayStorage[displayIndex + index].classList.add('tetromino')
      })
      squares.forEach(square => {
      square.classList.remove('tetromino')
      })
      // below this is just displaying the next up coming shape that is in the mini-grid
      random = nextRandom
      current = theTetrominoes[random][currentRotation]
      draw()
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
      //above this is displaying the next up coming shape that is in the mini-grid
    } else {
      //removing the currently falling shape in main grid
      squares.forEach(square => {
        if (!square.classList.contains('taken')) {
          square.classList.remove('tetromino')
        }
      })
      //removing the stored shape in .storage div
      displayStorage.forEach(square => {
        square.classList.remove('tetromino')
      })
      //displaying the currently falling shape in .storage div
      upNextTetrominoes[random].forEach(index => {
        displayStorage[displayIndex + index].classList.add('tetromino')
      })
      current = theTetrominoes[storedTetromino][0]
      draw()
      storedTetromino = random
    }
  }

  //add functionality to the button
  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    } else {
      draw()
      timerId = setInterval(moveDown, 500)
      nextRandom = Math.floor(Math.random()*theTetrominoes.length)
      displayShape()
    }
  })

  //add score
  function addScore() {
    for(let i = 0; i < 199; i += width) {
      const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]

      if(row.every(index => squares[index].classList.contains('taken'))) {
        score += 10
        scoreDisplay.innerHTML = score
        row.forEach(index => {
          squares[index].classList.remove('taken')
          squares[index].classList.remove('tetromino')
        })
        const squaresRemoved = squares.splice(i, width)
        squares = squaresRemoved.concat(squares)
        squares.forEach(cell => grid.appendChild(cell))
      }
  }
  }

  //game over
  function gameOver() {
    if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
      scoreDisplay.innerHTML = 'end'
      clearInterval(timerId)
    }
  }





})
