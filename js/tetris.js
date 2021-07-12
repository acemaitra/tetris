//* Set height to viewport height (fix mobile bug)
const vh = window.innerHeight * 0.01
document.documentElement.style.setProperty('--vh', `${vh}px`)

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const canvasHeight = window.innerHeight - (document.querySelector('header').clientHeight + document.querySelector('.botlane').clientHeight)
const canvasWidth = canvasHeight / ROWS * COLS

canvas.height = canvasHeight
canvas.width = canvasWidth

const scalingFactor = canvasHeight / ROWS
ctx.scale(scalingFactor, scalingFactor)

const gameboard = new Gameboard(ctx)

let score = 0
let highscore = localStorage.getItem('highscore')

if (!highscore) {
  localStorage.setItem('highscore', 0)
  highscore = 0
}

document.querySelector('.highscore > div').innerHTML = highscore

setInterval(() => {
  newGameState()
}, INTERVAL)

let newGameState = () => {
  fullSend() 
  if (gameboard.currentTetrimino === null) {
    const rand = Math.round(Math.random() * 6) + 1
    const newTetrimino = new Tetrimino(SHAPES[rand], ctx) 
    gameboard.currentTetrimino = newTetrimino 
    gameboard.moveDown()
  } else {
    gameboard.moveDown()
  }
}

const fullSend = () => {
  const allFilled = (row) => {
    for (let x of row) {
      if (x === 0) {
        return false
      }
    }
    return true
  }

  for (let i = 0; i < gameboard.grid.length; i++) {
    if (allFilled(gameboard.grid[i])) {
      score += 1
      document.querySelector('.score > div').innerHTML = score
      if (score > highscore) {
        localStorage.setItem('highscore', score)
        highscore = score
        document.querySelector('.highscore > div').innerHTML = highscore
      }
      gameboard.grid.splice(i, 1) 
      gameboard.grid.unshift([0,0,0,0,0,0,0,0,0,0])
    }
  }
}


//* CONTROLS

// Keyboard
document.addEventListener("keydown", (e) => {
  e.preventDefault() 
  switch(e.key) {
      case "w":
          gameboard.rotate() 
          break 
      case "d":
          gameboard.move(true) 
          break 
      case "s": 
          gameboard.moveDown() 
          break 
      case "a":
          gameboard.move(false) 
          break
  }
})


// Touch
let prevX = null
let prevY = null

canvas.addEventListener('touchmove', e => {
  console.log(e)
  if (prevX !== null || prevY !== null) {
    if (e.changedTouches[0].clientX > prevX + 24) {
      gameboard.move(true)
      prevX = e.changedTouches[0].clientX
    }
    if (e.changedTouches[0].clientX < prevX - 24) {
      gameboard.move(false)
      prevX = e.changedTouches[0].clientX
    }
    if (e.changedTouches[0].clientY > prevY + 22) {
      gameboard.moveDown()
      prevY = e.changedTouches[0].clientY
    }
  } else {
    prevX = e.changedTouches[0].clientX
    prevY = e.changedTouches[0].clientY
  }
})

canvas.addEventListener('touchend', () => {
  prevX = null
  prevY = null
}, false)

canvas.addEventListener('click', () => {
  gameboard.rotate()
}, false)


// Restart
const restartBtn = document.querySelector('.restart-btn')

restartBtn.addEventListener('click', () => {
  console.log('askjlhfla')
  gameboard.grid = gameboard.makeStartingGrid()
  gameboard.currentTetrimino = null
})

// restartBtn.onclick = function() {
//   gameboard.grid = this.makeStartingGrid()
// }