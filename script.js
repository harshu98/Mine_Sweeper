class Cell {
    constructor() {
        this.status = 0; // revealed or not
        if (Math.random(1) < 0.5) {
            this.type = 0; // safe
        } else {
            this.type = 1; // has bomb
        }
        this.flagged = false;
        this.type = 0;
        this.value = -1;
    }
}
let canvas, ctx, width, height, cellWidth, cellHeight;
let intervalID = null;
let grid = [];
let bombsCoordinates = [];
let timer = 0;
let bet = 0.0;
let clicksCount = 0;
let flagsCount = 0;
let rowsCount = 10;
let colsCount = rowsCount;
let gridRatio = rowsCount / colsCount;
let difficultyLevels = {
    'easy': 0.1,
    'medium': 0.3,
    'hard': 0.5
};
let transbet = {};
let postData = {};
let multiplier = 10;
let currentLevel = 'medium';
let maxBombsCount = Math.floor(rowsCount * rowsCount * difficultyLevels[currentLevel]);
let start = false;


let terrain = new Image();
terrain.src = "./assets/images/terrain.png";
let bomb = new Image();
bomb.src = "./assets/images/bomb.png";
let flag = new Image();
flag.src = "./assets/images/flag.png";
let revealed_img = new Image();
revealed_img.src = "./assets/images/revealed.png";


let blast = new Audio();
blast.src = "./assets/audio/blast.wav";
let wave = new Audio();
wave.src = "./assets/audio/wave.wav";
let reveal = new Audio();
reveal.src = "./assets/audio/reveal.wav";
let dig = new Audio();
dig.src = "./assets/audio/dig.wav";
let win = new Audio();
win.src = "./assets/audio/win.wav";
let coin = new Audio();
coin.src = "./assets/audio/coin.wav";
let error = new Audio();
error.src = "./assets/audio/error.wav";

window.addEventListener('load', initialize, false);
window.addEventListener('resize', initialize, false);


function initialize() {
    setDimensions();
    setCanvas();
    restart();
}

function restart() {
    hideAllOverlays();
    resetBet()
    getBet();
    stopGame();
    resetTimer();
    grid = [];
    bombsCoordinates = [];
    timer = 0;
    clicksCount = 0;
    flagsCount = 0;
    setAndDrawGrid();
    placeBombs();
    showDetails();
    start = true;
}

function setDimensions() {
    // let responsiveWidth = window.innerWidth * 0.90;
    // let responsiveHeight = window.innerHeight * 0.90;
    let responsiveWidth = 700;
    let responsiveHeight = 700;
    let responsive = Math.min(responsiveHeight, responsiveWidth);
    width = responsive;
    height = width * gridRatio;
    cellWidth = width / colsCount;
    cellHeight = height / rowsCount;
}

function setCanvas() {
    canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    canvas.addEventListener('click', canvasClicked);
    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        canvasRightClicked(e)
    }, false);
}

function setAndDrawGrid() {
    let arr = new Array(rowsCount);
    for (let row = 0; row < arr.length; row++) {
        arr[row] = new Array(colsCount);
        grid[row] = arr[row];
        for (let col = 0; col < arr[row].length; col++) {
            drawUnrevealedCell(row, col);
            grid[row][col] = new Cell();
        }
    }
}

function placeBombs() {
    while (bombsCoordinates.length < maxBombsCount) {
        let row = Math.floor(Math.random() * rowsCount);
        let col = Math.floor(Math.random() * colsCount);
        if (grid[row][col].type == 0) {
            grid[row][col].type = 1;
            bombsCoordinates.push([row, col]);
        }
    }
}

function drawUnrevealedCell(row, col) {
    // ctx.fillStyle = "#709958";
    // ctx.fillRect(cellWidth * col, cellHeight * row, cellWidth, cellHeight);
    ctx.drawImage(terrain, cellWidth * col, cellHeight * row, cellWidth, cellHeight);

    ctx.strokeStyle = "#88d717";
    ctx.lineWidth = 1;
    ctx.strokeRect(cellWidth * col, cellHeight * row, cellWidth, cellHeight);
}

function drawFlaggedCell(row, col) {
    ctx.drawImage(flag, cellWidth * col, cellHeight * row, cellWidth, cellHeight);
}

function drawRevealedCell(row, col) {
    // ctx.fillStyle = "#e3edff";
    // ctx.fillRect(cellWidth * col, cellHeight * row, cellWidth, cellHeight);
    ctx.drawImage(revealed_img, cellWidth * col, cellHeight * row, cellWidth, cellHeight);

    ctx.strokeStyle = "#88d717";
    ctx.lineWidth = 1;
    ctx.strokeRect(cellWidth * col, cellHeight * row, cellWidth, cellHeight);

    if (grid[row][col].type == 1) {
        ctx.drawImage(bomb, cellWidth * col, cellHeight * row, cellWidth, cellHeight);
    } else {
        ctx.font = cellWidth * 0.9 + "px Arial";
        ctx.fillStyle = getColorByValue(grid[row][col].value);
        ctx.textAlign = "center";
        ctx.fillText(grid[row][col].value, (cellWidth * col) + cellWidth / 2, (cellHeight * row) + cellHeight * 0.8, cellWidth, cellHeight);
    }
}

function getColorByValue(value) {
    switch (value) {
        case 1:
            return 'blue';
        case 2:
            return 'red';
        case 3:
            return 'yellow';
        case 4:
            return 'red';
        default:
            return 'red';
    }
}

function getTopAndLeft(el) {
    var rect = el.getBoundingClientRect();
    var docEl = document.documentElement;
    return {
        left: rect.left + (window.pageXOffset || docEl.scrollLeft || 0),
        top: rect.top + (window.pageYOffset || docEl.scrollTop || 0)
    };
}

function canvasClicked(event) {
    if (!start) return false;
    if (timer == 0 && clicksCount == 0) {
        intervalID = setInterval(setTime, 1000);
    }
    let cell = getClickedCell(event);
    if (grid[cell.row][cell.col].flagged) return;
    if (grid[cell.row][cell.col].status == 0) {
        let exploded = evaluateCell(cell.row, cell.col);
        if (exploded) {
            gameOver();
        } else {
            clicksCount++;
            if (isWin()) {
                start = false;
                win.play();
                stopGame();
                winShow();
                // Swal.fire(
                //     'Winner!',
                //     '<b>Your time is  ' + getTime() + '</b>',
                //     'success'
                // ).then((result) => {
                //     /* Read more about isConfirmed, isDenied below */
                //     if (result.isConfirmed) {
                //         restart();
                //     }
                // });
            }
            dig.play();
        }
        revealCells();
    }
}

function canvasRightClicked(event) {
    if (!start) return false;
    let cell = getClickedCell(event);
    if (grid[cell.row][cell.col].status == 1) return;
    grid[cell.row][cell.col].flagged = !grid[cell.row][cell.col].flagged;
    wave.play();
    revealCells();
}

function getClickedCell(event) {
    let canvasCoordinates = getTopAndLeft(canvas);
    let clickedCol = Math.ceil((event.clientX - canvasCoordinates.left) / cellWidth);
    let clickedRow = Math.ceil((event.clientY - canvasCoordinates.top) / cellHeight);
    return {
        row: clickedRow - 1,
        col: clickedCol - 1
    };
}

function evaluateCell(rowId, colId) {

    let blast = false;
    grid[rowId][colId].status = 1;
    if (grid[rowId][colId].type == 1) {
        blast = true;
    } else {
        let proximity = countProximity(rowId, colId);
        if (proximity == '') {
            reveal.play();
            zeroHit(rowId, colId);
        } else {
            grid[rowId][colId].value = proximity;
        }

    }
    return blast;
}

function countProximity(rowId, colId) {
    let total = 0;
    for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
            if (rowId + a > -1 && rowId + a < rowsCount && colId + b > -1 && colId + b < colsCount) {
                if (grid[rowId + a][colId + b].type == 1) {
                    total++;
                }
            }
        }
    }
    total = total > 0 ? total : '';
    return total;
}

function zeroHit(rowId, colId) {

    grid[rowId][colId].value = countProximity(rowId, colId);
    for (let a = -1; a <= 1; a++) {
        for (let b = -1; b <= 1; b++) {
            if (rowId + a > -1 && rowId + a < rowsCount && colId + b > -1 && colId + b < colsCount) {
                if (grid[rowId + a][colId + b].status == 0 && grid[rowId + a][colId + b].type == 0) {
                    grid[rowId + a][colId + b].value = countProximity(rowId + a, colId + b);
                    grid[rowId + a][colId + b].status = 1;
                    grid[rowId + a][colId + b].flagged = false;
                    if (countProximity(rowId + a, colId + b) == 0) {
                        zeroHit(rowId + a, colId + b);
                    }
                }
            }
        }
    }

}


function revealCells() {
    flagsCount = 0;
    for (let row = 0; row < rowsCount; row++) {
        for (let col = 0; col < colsCount; col++) {
            if (grid[row][col].status == 1) {
                drawRevealedCell(row, col);
            } else {
                drawUnrevealedCell(row, col);
            }
            if (grid[row][col].flagged) {
                flagsCount++;
                drawFlaggedCell(row, col);
            }

        }
    }
    showDetails();
}


function gameOver() {
    stopGame();
    blast.play();
    explodeAllBombs();
    revealCells();
    looseShow();

    // Swal.fire(
    //     'Looser!',
    //     'You have exploded the bomb',
    //     'warning'
    // ).then((result) => {
    //     /* Read more about isConfirmed, isDenied below */
    //     if (result.isConfirmed) {
    //         restart();
    //     }
    // });
}

function explodeAllBombs() {
    for (let row = 0; row < rowsCount; row++) {
        for (let col = 0; col < colsCount; col++) {
            if (grid[row][col].type == 1) {
                grid[row][col].flagged = false;
                grid[row][col].status = 1;
            }
        }
    }
}

function stopGame() {
    start = false;
    stopTimer();
}

function isWin() {
    let win = true;
    for (let row = 0; row < rowsCount; row++) {
        for (let col = 0; col < colsCount; col++) {
            if (grid[row][col].type == 0 && grid[row][col].status == 0) {
                win = false;
            }
        }
    }
    return win;
}

function showDetails() {
    // let bombsCount = document.getElementById('bombsCount');
    // bombsCount.innerHTML = bombsCoordinates.length;

    // let flagsCountElement = document.getElementById('flagsCount');
    // flagsCountElement.innerHTML = flagsCount;

    let clicksCountElement = document.getElementById('clicksCount');
    clicksCountElement.innerHTML = clicksCount;
}

function resetTimer() {
    stopTimer();
    timer = 0;
    let time = getTime();
    var timeElement = document.getElementById("timer");
    timeElement.innerHTML = time;
}

function stopTimer() {
    if (intervalID != null) clearInterval(intervalID);
}

function setTime() {
    ++timer;
    let time = getTime();
    var timeElement = document.getElementById("timer");
    timeElement.innerHTML = time;
}

function getTime() {
    return parseInt(timer / 60) + 'm  ' + timer % 60 + ' s';
}

function getBet() {
    betShow();

    // Swal.fire({
    //     title: 'Enter Your Bet',
    //     input: 'number',
    //     inputAttributes: {
    //         autocapitalize: 'off'
    //     },
    //     showCancelButton: false,
    //     confirmButtonText: 'Submit',
    //     showLoaderOnConfirm: true,
    //     preConfirm: (input) => {
    //         if (!input || input <= 0) {
    //             return Swal.showValidationMessage(
    //                 `Request failed: Invalid input`
    //             );
    //         }
    //     },
    //     allowOutsideClick: false
    // }).then((result) => {
    //     if (result.isConfirmed) {
    //         setBet(result.value);
    //         Swal.fire({
    //             title: `Your bet : ` + result.value
    //         })
    //     }
    // })
}

function resetBet() {
    bet = 0.0;
    setBet();
}

function changeBet(value) {
    let current = parseFloat(bet);
    current += value;
    bet = Math.max(current, 0).toFixed(1);
    setBet();
}

function setBet() {
    let betElement = document.getElementById('betInput');
    betElement.value = bet;
}

document.getElementById("replayBtn-loose").addEventListener("click", function() {
    dig.play();
    postGame();
    restart();
});
document.getElementById("replayBtn-win").addEventListener("click", function() {
    dig.play();
    postGame();
    restart();
});
// document.getElementById("exitBtn-loose").addEventListener("click", looseHide);
// document.getElementById("exitBtn-win").addEventListener("click", winHide);
document.getElementById("plusImage").addEventListener("click", function() {
    changeBet(0.1);
});
document.getElementById("minusImage").addEventListener("click", function() {
    changeBet(-0.1);
});
document.getElementById("okImg").addEventListener("click", function() {
    changeBet(0);
    if (bet <= 0) {
        error.play();
    } else {
        document.getElementById("gif").style.display = "block";
        crestetransaction(bet);
    }
});
async function crestetransaction(bet) {
    const phantomWallet = cryptoUtils.phantomWallet;
    // Number(bet)
    await phantomWallet.requestTransaction(Number(bet)).then(result => {
        {
            transbet = {
                "walletID": phantomWallet.wallet_pubkey,
                "gameName": "Minesweeper",
                "userTransactionID": result,
                "typeOfPlay": "SOL",
                "betAmount": bet,
            };
            Notify("Transaction Successful");
            document.getElementById("gif").style.display = "none";
            coin.play();
            betHide();
        }
    }).catch((err) => {
        Notify("Please Approve Transaction");
        document.getElementById("gif").style.display = "none";
        error.play();
    });
}

function Notify(text) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(text);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(function(permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                var notification = new Notification(text);
            }
        });
    }
}

function postGame() {
    let winAmount = 0;
    if (isWin()) {
        winAmount = transbet["betAmount"] * multiplier;
    };
    postData = {
        ...transbet,
        "clicks": clicksCount,
        "timer": `${timer} sec`,
        "level": currentLevel,
        "amountWon": isWin() ? winAmount : 0,
        "amountLost": winAmount != 0 ? 0 : transbet["betAmount"],
        "gameResult": winAmount > 0 ? "WIN" : "LOSS",
        'amountPaid': (winAmount - (winAmount * 0.015)),
    }
    axios.post(`${DB_URL}/api/game/mineSweeper`, {
        ...postData
    });
}