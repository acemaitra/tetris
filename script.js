let canvas;
let ctx;
let gBArrayHeight = 20; // Zellen Anzahl (Array Höhe)
let gBArrayWidth = 12; // Zellen Anzahl (Array Breite)
let startX = 4; // X-Start Position für Tetromino
let startY = 0; // Y-Start Position für Tetromino
let score = 0; // Score-Zähler
let level = 1; // aktuelles Level
let winOrLose = "Playing";

// Used as a look up table where each value in the array
// contains the x & y position we can use to draw the
// box on the canvas
let coordinateArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));
let curTetromino = [[1,0], [0,1], [1,1], [2,1]]

// Will hold all Tetrominos
let tetrominos = [];
// Tetromino Array mit Farben, angepasst zum Tetromino Array
let tetrominoColors = ['purple', 'cyan', 'blue', 'yellow', 'orange', 'green', 'red'];
// Holds current Tetromino color
let curTetrominoColor;

// Erstellt Gameboard Array damit man weiß so squares sind
let gameBoardArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

// Array um angehaltene Formen zu halten
let stoppedShapeArray = [...Array(gBArrayHeight)].map(e => Array(gBArrayWidth).fill(0));

// for tracking the direction of Tetromino I'm moving -> stop trying to move through walls
let DIRECTION = {
    IDLE: 0,
    DOWN: 1,
    LEFT: 2,
    RIGHT: 3
};
let direction;

class Coordinates{
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

// Execute SetupCanvas when page loads
document.addEventListener('DOMContentLoaded', SetupCanvas)

// Creates the array with square coordinates
function CreateCoordArray(){
    let i = 0, j = 0;
    for(let y = 9; y <= 446; y += 23) {
        for (let x = 11; x <= 264; x += 23) {
            coordinateArray[i][j] = new Coordinates(x,y);
            i++;
        }
        j++;
        i = 0;
    }
}

function SetupCanvas() {
    canvas = document.getElementById('my-canvas');
    ctx = canvas. getContext('2d');
    canvas.width = 936;
    canvas.height = 956;

    // verdoppelt die Größe der Elemente, to fit screen
    ctx.scale(2,2);

    // Draw Canvas Hintergrund
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Gameboard rectangle
    ctx.strokeStyle = 'black';
    ctx.strokeRect(8, 8, 280, 462);

    // Font für Score
    ctx.fillStyle = 'black';
    ctx.font = '21px Arial';

    // Draw Score
    ctx.fillText("SCORE", 300, 98);
    ctx.strokeRect(300, 107, 161, 24);
    ctx.fillText(score.toString(), 310, 127);

    // Draw Level
    ctx.fillText("LEVEL", 300, 157);
    ctx.strokeRect(300, 171, 161, 24);
    ctx.fillText(level.toString(), 310, 190);

    // Draw Next
    ctx.fillText("WIN / LOSE", 300, 221);
    ctx.fillText(winOrLose, 310, 261);
    ctx.strokeRect(300, 232, 161, 95);

    // Draw Controls
    ctx.fillText("CONTROLS", 300, 354);
    ctx.strokeRect(300, 366, 161, 104);
    ctx.font = '19px Arial';
    ctx.fillText("A : Move Left", 310, 388);
    ctx.fillText("D: Move Right", 310, 413);
    ctx.fillText("S: Move Down", 310, 438);
    ctx.fillText("W: Rotate Right", 310, 463);

    // Handle keyboard presses
    document.addEventListener('keydown', HandleKeyPress);

    // Erstellt das Array von Tetromino Array
    CreateTetrominos();
    // Generiert random Tetromino
    CreateTetromino();

    // Create the rectangle lookup table
    CreateCoordArray();

    DrawTetromino();
}

function DrawTetromino() {
    // cycle through x & y array from tetromino looking for all places a square would be drawn
    for(let i = 0; i < curTetromino.length; i++){

        // Move the Tetromino x&y values to the tetromino
        // Erscheint in Mitte vom Gameboard
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;

        // Puts Tetroino shape in gameboard array
        gameBoardArray[x][y] = 1;

        // looks for x&y values in lookup table
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;

        // Zeichnet Square in x&y Koordinaten welche lookup table zur Verfügung stellt
        ctx.fillStyle = curTetrominoColor;
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

function HandleKeyPress(key) {
    if(winOrLose != "Game Over") {
        if (key.keyCode === 65) {
            direction = DIRECTION.LEFT;
            if (!HittingTheWall() && !CheckForHorizontalCollision()) {
                DeleteTetromino();
                startX--;
                DrawTetromino();
            }
        } else if (key.keyCode === 68) {
            direction = DIRECTION.RIGHT;
            if (!HittingTheWall() && !CheckForHorizontalCollision()) {
                DeleteTetromino();
                startX++;
                DrawTetromino();
            }
        } else if (key.keyCode === 83) {
            MoveTetrominoDown();
        } else if (key.keyCode === 87) {
            RotateTetromino();
        }
    }
}

function MoveTetrominoDown(){
    // trac that i want to move down
    direction = DIRECTION.DOWN;
    if(!CheckForVerticalCollision()){
        DeleteTetromino();
        startY++;
        DrawTetromino();
    }
}

// Tetromino fällt jede Sekunde automatisch
window.setInterval(function (){
    if (winOrLose != "Game Over") {
        MoveTetrominoDown();
    }
}, 1000)

// Löscht vorherig erstelltes Tetromino
function DeleteTetromino() {
    for (let i = 0; i < curTetromino.length; i++) {
        let x = curTetromino[i][0] + startX;
        let y = curTetromino[i][1] + startY;

        // Löscht Tetromino Viereck vom vorherigen gameboard array
        gameBoardArray[x][y] = 0;

        // Weiß wo Farbige Quadrate used to be
        let coorX = coordinateArray[x][y].x;
        let coorY = coordinateArray[x][y].y;
        ctx.fillStyle = 'white';
        ctx.fillRect(coorX, coorY, 21, 21);
    }
}

// Erstellt random Tetrominos mit Farbe
// Index mit farbigem Block wird definiert
function CreateTetrominos() {
    // T
    tetrominos.push([[1,0], [0,1], [1,1], [2,1]]);
    // I
    tetrominos.push([[0,0], [1,0], [2,0], [3,0]]);
    // J
    tetrominos.push([[0,0], [0,1], [1,1], [2,1]]);
    // square
    tetrominos.push([[0,0], [0,1], [1,0], [1,1]]);
    // Z
    tetrominos.push([[0,0], [1,0], [1,1], [2,1]]);
    // L
    tetrominos.push([[2,0], [0,1], [1,1], [2,1]]);
    // S
    tetrominos.push([[1,0], [2,0], [0,1], [1,1]]);
}

function CreateTetromino() {
    // Get a random tetromino tndex
    let randomTetromino = Math.floor(Math.random() * tetrominos.length);
    // Set the one to draw
    curTetromino = tetrominos[randomTetromino];
    // Get the color for it
    curTetrominoColor = tetrominoColors[randomTetromino];
}

// Kontrolliert ob Tetromino Wand berührt
// Cycle through the squares adding the upper left hand corner position to see if the value is <= to 0 or >= 11
function HittingTheWall() {
    for (let i = 0; i < curTetromino.length; i++) {
        let newX = curTetromino[i][0] + startX;
        if (newX <= 0 && direction === DIRECTION.LEFT) {
            return true;
        } else if(newX >= 11 && direction === DIRECTION.RIGHT) {
            return true;
        }
    }
    return false;
}

function CheckForVerticalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;
    for(let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;
        if(direction === DIRECTION.DOWN) {
            y++;
        }

            if (typeof stoppedShapeArray[x][y+1] === 'string') {
                DeleteTetromino();
                startY++;
                DrawTetromino();
                collision = true;
                break;
            }
            if(y >= 20) {
                collision = true;
                break;
            }
        }

    if(collision) {
        if(startY <= 2) {
            winOrLose = "Game Over";
            ctx.fillStyle = 'white';
            ctx.fillRect(310, 242, 140, 30);
            ctx.fillStyle = 'black';
            ctx.fillText(winOrLose, 310, 261);
        } else {
            for(let i = 0; i < tetrominoCopy.length; i++) {
                let square = tetrominoCopy[i];
                let x = square[0] + startX;
                let y = square[1] + startY;
                stoppedShapeArray[x][y] = curTetrominoColor;
            }

            CheckForCompletedRows();
            CreateTetromino();
            direction = DIRECTION.IDLE;
            startX = 4;
            startY = 0;
            DrawTetromino();
        }
    }
}

function CheckForHorizontalCollision() {
    let tetrominoCopy = curTetromino;
    let collision = false;
    for(let i = 0; i < tetrominoCopy.length; i++) {
        let square = tetrominoCopy[i];
        let x = square[0] + startX;
        let y = square[1] + startY;

        if(direction === DIRECTION.LEFT) {
            x--;
        } else if (direction === DIRECTION.RIGHT) {
            x++;
        }
        var stoppedShapeVal = stoppedShapeArray[x][y];
        if (typeof stoppedShapeVal === 'string') {
            collision = true;
            break;
        }
    }
    return collision
}

function CheckForCompletedRows(){
    let rowsToDelete = 0;
    let startOfDeletion = 0;
    for (let y = 0; y < gBArrayHeight; y++){
        let completed = true;
        for (let x = 0; x < gBArrayWidth; x++) {
            let square = stoppedShapeArray[x][y];
            if(square === 0 || (typeof  square === 'undefined')){
                completed = false;
                break;
            }
        }

        if (completed) {
            if(startOfDeletion === 0) startOfDeletion = y;
            rowsToDelete++;
            for (let i = 0; i < gBArrayWidth; i++) {
                stoppedShapeArray[i][y] = 0;
                gameBoardArray[i][y] = 0;
                let coorX = coordinateArray[i][y].x;
                let coorY = coordinateArray[i][y].y;
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
    if (rowsToDelete > 0) {
        score += 10;
        ctx.fillStyle = 'white';
        ctx.fillRect(310, 109, 140, 19);
        ctx.fillStyle = 'black';
        ctx.fillText(score.toString(), 310, 127);
        MoveAllRowsDown(rowsToDelete, startOfDeletion)
    }
}

function MoveAllRowsDown(rowsToDelete, startOfDeletion) {
    for (var i = startOfDeletion - 1; i >= 0; i--){
        for (var x = 0; x < gBArrayWidth; x++) {
            var y2 = i + rowsToDelete;
            var square = stoppedShapeArray[x][i];
            var nextSquare = stoppedShapeArray[x][y2];
            if (typeof square === 'string') {
                nextSquare = square;
                gameBoardArray[x][y2] = 1;
                stoppedShapeArray[x][y2] = square;
                let coorX = coordinateArray[x][y2].x;
                let coorY = coordinateArray[x][y2].y;
                ctx.fillStyle = nextSquare;
                ctx.fillRect(coorX, coorY, 21, 21);

                square = 0;
                gameBoardArray[x][i] = 0;
                stoppedShapeArray[x][i] = 0;
                coorX = coordinateArray[x][i].x;
                coorY = coordinateArray[x][i].y;
                ctx.fillStyle = 'white';
                ctx.fillRect(coorX, coorY, 21, 21);
            }
        }
    }
}

function RotateTetromino() {
    let newRotation = new Array();
    let tetrominoCopy = curTetromino;
    let curTetrominoBU;

    for (let i = 0; i < tetrominoCopy.length; i++) {
        curTetrominoBU = [...curTetromino];
        let x = tetrominoCopy[i][0];
        let y = tetrominoCopy[i][1];
        let newX = (GetLastSquareX() - y);
        let newY = x;
        newRotation.push([newX, newY]);
    }
    DeleteTetromino();

    try {
        curTetromino = newRotation;
        DrawTetromino();
    }
    catch(e) {
        if(e instanceof TypeError) {
            curTetromino = curTetrominoBU;
            DeleteTetromino();
            DrawTetromino();
        }
    }
}

function GetLastSquareX(){
    let lastX = 0;
    for (let i = 0; i < curTetromino.length; i++) {
        let square = curTetromino[i];
        if (square[0] > lastX)
            lastX = square[0];
    }
    return lastX;
}