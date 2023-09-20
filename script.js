const fields = document.querySelectorAll('.field');
const xPlayerTurn = document.querySelector('.player-x');
const oPlayerTurn = document.querySelector('.player-o');
const replayButton = document.querySelector('.replay-button');
const gameMessage = document.querySelector('.game-message');

const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6]             // Diagonal
];
const LENGTH = 9;
const message = {
    'x': 'COMPUTER WIN!',
    'o': 'PLAYER WIN!',
    null: 'DRAW!'
};

let gameBoard = GameBoard();
const computer = Player('x');
const human = Player('o');

function GameBoard() {
    let board = new Array(LENGTH);

    const reset = () => { board = new Array(LENGTH) };
    const set = (index, data) => {
        if ((index >= 0 && index < board.length) &&
            data === 'x' || data === 'o' || data === undefined)
            board[index] = data;
    };
    const get = (index) => board[index];
    const isBoardFull = () => {
        for (let i = 0; i < LENGTH; i++) {
            if (board[i] === undefined){
                return false;
            }
        }
        return true;
    }
    const checkWin = () => {
        for (let i = 0; i < WIN_COMBOS.length; i++) {
            const winIndices = WIN_COMBOS[i];
            if (winIndices.every(i => board[i] === 'x')) {
                return {index: i, sign: 'x'};
            } else if (winIndices.every(i => board[i] === 'o')) {
                return {index: i, sign: 'o'};
            }
        }
        return null;
    }

    return { reset, set, get, isBoardFull, checkWin };
}

function Player (sign) {
    const _sign = sign.toLowerCase();
    const getSign = () => _sign;
    return { getSign };
}

function render() {
    fields.forEach((field, index) => {
        const item = gameBoard.get(index);
        if (item !== undefined) {
            field.textContent = item;
            field.disabled = true;
        } else {
            field.textContent = '';
            field.disabled = false;
        }
    })
}

function toggleTurn(turn) {
    if (turn === 'x') {
        xPlayerTurn.classList.remove('turn');
        oPlayerTurn.classList.add('turn');
    } else {
        oPlayerTurn.classList.remove('turn');
        xPlayerTurn.classList.add('turn');
    }
}

function turn (player, index) {
    gameBoard.set(index, player.getSign());
    render();
    toggleTurn(player.getSign());
    const winner = gameBoard.checkWin();
    if (winner !== null) gameOver(winner);
    else if (gameBoard.isBoardFull()) gameOver(null);
}

function playerClick(index) {
    turn(human, index);
    computerMove();
}

function minimax(board, depth, isMaxPlayer) {
    const result = board.checkWin();
    if (result !== null) {
        if (result.sign === 'x'){
            return 10 - depth;
        } else {
            return -10 + depth;
        }
    } else if (board.isBoardFull()){
        return 0;
    }

    if (isMaxPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < LENGTH; i++) {
            if (board.get(i) === undefined) {
                board.set(i, 'x');
                const score = minimax(board, depth + 1, false);
                board.set(i, undefined);
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < LENGTH; i++) {
            if (board.get(i) === undefined) {
                board.set(i, 'o');
                const score = minimax(board, depth + 1, true);
                board.set(i, undefined);
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

function findBestMove(board) {
    let bestMove = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < LENGTH; i++) {
        if (board.get(i) === undefined) {
            board.set(i, 'x');
            const score = minimax(board, 0, false);
            board.set(i, undefined);
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function computerMove() {
    if (gameBoard.checkWin() === null && !gameBoard.isBoardFull()) {
        disableFields();
        let index = findBestMove(gameBoard);
        setTimeout(() => turn(computer, index), 1500);
    }
}

function disableFields() {
    fields.forEach(field => {
        field.disabled = true;
    });
}

function gameStart() {
    fields.forEach(field => field.classList.remove('win-box'));
    gameBoard.reset();
    render();
    toggleTurn('o');
    computerMove();
}

function gameOver(winner) {
    disableFields();
    if (winner) {
        gameMessage.textContent = message[winner.sign];
        WIN_COMBOS[winner.index].forEach(index => {
            fields[index].classList.add('win-box');
        });
    } else {
        gameMessage.textContent = message[winner];
        fields.forEach(field => {
            field.classList.add('win-box');
        });
    }

    gameMessage.classList.add('show');
}


function displayerController() {
    fields.forEach((field, index) => {
        field.addEventListener('click', playerClick.bind(field, index));
    });
    gameMessage.addEventListener('animationend', () =>
        setTimeout(() =>
            gameMessage.classList.remove('show'),
            500
        )
    );
    replayButton.onclick = gameStart;
    computerMove();
    toggleTurn('o');
}
 displayerController();