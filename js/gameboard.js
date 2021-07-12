class Gameboard {
  constructor(ctx) {
    this.ctx = ctx
    this.currentTetrimino = null // Piece class
    this.grid = this.makeStartingGrid()
  }

  makeStartingGrid() {
    let grid = []
  
    for (let i = 0; i < ROWS; i++) {
      grid.push([])
      for (let j = 0; j < COLS; j++) {
        grid[grid.length - 1].push(0)
      }
    }
  
    return grid
  }

  collision(x, y) {
    const shape = this.currentTetrimino.shape
    const n = shape.length
  
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (shape[i][j] !== 0) {
          let p = x + j
          let q = y + i
          if (p >= 0 && p < COLS && q < ROWS) {
            if (this.grid[q][p] !== 0) {
              return true
            }
          } else {
            return true
          }
        }
      }
    }

    return false
  }

  renderGameState() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        let cell = this.grid[i][j]
        this.ctx.fillStyle = COLORS[cell]
        this.ctx.fillRect(j, i, 1, 1)

        if (this.currentTetrimino !== null) {
          this.currentTetrimino.render()
        }
      }
    }
  }

  moveDown() {
    if (this.currentTetrimino === null) {
      this.renderGameState()
      return
    } else if (this.collision(this.currentTetrimino.x, this.currentTetrimino.y + 1)) {
      const shape = this.currentTetrimino.shape
      const x = this.currentTetrimino.x
      const y = this.currentTetrimino.y
      shape.map((row, i) => {
        row.map((cell, j) => {
          let p = x + j
          let q = y + i
          if (p >= 0 && p < COLS && q < ROWS && cell !== 0) {
            this.grid[q][p] = shape[i][j]
          }
        })
      })

      if (this.currentTetrimino.y === 0) {
        this.gameOver()
      }

      this.currentTetrimino = null
    } else {
      this.currentTetrimino.y += 1
    }

    this.renderGameState()
  }

  move(right) {
    if (this.currentTetrimino === null) {
      return
    }

    let x = this.currentTetrimino.x 
    let y = this.currentTetrimino.y 
    if (right) {
      // move right
      if (!this.collision(x + 1, y)) {
          this.currentTetrimino.x += 1
      }
    } else {
      // move left
      if (!this.collision(x - 1, y)) {
          this.currentTetrimino.x -= 1
      }
    }
    this.renderGameState()
  }

  rotate() {
    if (this.currentTetrimino !== null) {
      let shape = [...this.currentTetrimino.shape.map((row) => [...row])]
      // transpose of matrix 
      for (let y = 0; y < shape.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [shape[x][y], shape[y][x]] = 
          [shape[y][x], shape[x][y]]
        }
      }
      // reverse order of rows 
      shape.forEach((row => row.reverse()))
      if (!this.collision(this.currentTetrimino.x, this.currentTetrimino.y, shape)) {
        this.currentTetrimino.shape = shape
      }
    }
    this.renderGameState()
  }

  gameOver() {
    alert('Game over')
    this.grid = this.makeStartingGrid()
  }
}

const gb = new Gameboard()
gb.grid