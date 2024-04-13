function Player(sign) {
    const _sign = sign.toLowerCase();
    const getSign = () => _sign;
    return { getSign };
}

function GameBoard() {
    const fieldCount = 9;
    let board = new Array(fieldCount);

    const resetBoard = () => {
        board = new Array(fieldCount)
    };

    const setField = (index, data) => {
        if ((index >= 0 && index < board.length) &&
            (data === 'x' || data === 'o') &&
            (board[index] !== 'x' && board[index] !== 'o')) {
            board[index] = data;
            return true;
        }
        return false;
    };

    const getField = (index) => board[index];

    return {
        resetBoard,
        setField,
        getField,
        fieldCount
    };
};


function GameController(player1Sign) {
    /**
     * @param {string} player1Sign - The selected sign(x|o) of player 1
     */
    const winCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];
    const gameBoard = GameBoard();

    /**
     * Reprsents player in the game
     * @type {Player}
     */
    const player1 = Player(player1Sign);

    /**
     * Represent computer in the game
     * @type {Player}
     */
    const player2 = Player((player1.getSign() === 'x')? 'o': 'x');

    let currentPlayer = (player1Sign === 'x')? player1: player2;
    let player1Score = 0,
        player2Score = 0,
        tieCount = 0;

    const checkWinner = () => {
        for (let i = 0; i < winCombos.length; i++) {
            const winIndices = winCombos[i];
            if (winIndices.every(i => gameBoard.getField(i) === player1.getSign())) {
                return { player_no: 1, win_fields: winIndices, sign: player1.getSign() };
            }
            if (winIndices.every(i => gameBoard.getField(i) === player2.getSign())) {
                return { player_no: 2, win_fields: winIndices, sign: player2.getSign() };
            }
        }
        return null;
    }

    const isGameBoardFull = () => {
        for (let i = 0; i < gameBoard.fieldCount; i++) {
            if (gameBoard.getField(i) === undefined) {
                return false;
            }
        }
        return true;
    }

    const togglePlayer = () => {
        if (currentPlayer === player1) {
            currentPlayer = player2;
        } else {
            currentPlayer = player1;
        }
    }

    const makeCurrentPlayerMove = (index) => {
        return gameBoard.setField(index, currentPlayer.getSign());
    }

    const isPlayer1Turn = () => (currentPlayer === player1);

    const isPlayer2Turn = () => (currentPlayer === player2);

    const getCurrentPlayer = () => currentPlayer;

    const getField = (index) => gameBoard.getField(index);

    const getAllField = () => {
        const fields = [];
        for (let i = 0; i < gameBoard.fieldCount; ++i) {
            fields.push(gameBoard.getField(i));
        }
        return fields;
    }

    const clearBoard = () => gameBoard.resetBoard();

    return {
        player1,
        player2,
        getCurrentPlayer,
        getField,
        getAllField,
        clearBoard,
        togglePlayer,
        makeCurrentPlayerMove,
        isGameBoardFull,
        isPlayer1Turn,
        isPlayer2Turn,
        checkWinner,
        tieCount,
        player1Score,
        player2Score,
    };
}

(function displayController() {
    const gameStartButton = document.querySelector('.game-start-button');
    const gameoverModal = document.querySelector('.overlay');
    const gameMessage = document.querySelector('.message');
    const menuButton = document.querySelector('.menu-button');
    const nextRoundButton = document.querySelector('.next-round-button');
    const playerXTurn = document.querySelector('.player-x');
    const playerOTurn = document.querySelector('.player-o');
    const fields = document.querySelectorAll('.field');
    const scoreX = document.querySelector('.score.x');
    const scoreO = document.querySelector('.score.o');
    const scoreTie = document.querySelector('.score.tie');
    const quitGameButton = document.querySelector('.quit-game.button');
    let gameController,
        difficulty,
        gameover = false;


    const showGame = () => {
        document.querySelector('.select-symbol').classList.add('hide');
        document.querySelector('.main-game').classList.remove('hide');
        renderGame();
    }

    const showMenu = () => {
        document.querySelector('.select-symbol').classList.remove('hide');
        document.querySelector('.main-game').classList.add('hide');
        resetGame();
    }

    const nextRound = () => {
        gameoverModal.classList.add('hide');
        gameover = false;
        displayScores();
        makeComputerMove();
    }

    const renderGame = () => {
        if (!gameController) {
            return;
        }
        const currentPlayer = gameController.getCurrentPlayer();
        playerXTurn.classList.toggle('active', currentPlayer.getSign() === 'x');
        playerOTurn.classList.toggle('active', currentPlayer.getSign() === 'o');

        fields.forEach((field, index) => {
            const fieldValue = gameController.getField(index);
            field.textContent = fieldValue || '';
        });

        const winner = gameController.checkWinner();
        if (winner || gameController.isGameBoardFull()) {
            showGameResult(winner);
        }
    }

    const resetGame = () => {
        gameController = null;
        gameover = false;
        gameoverModal.classList.add('hide');
        document.querySelectorAll('.field').forEach(field => {
            field.textContent = '';
        });
        scoreX.textContent = '0';
        scoreO.textContent = '0';
        scoreTie.textContent = '0';
    }

    const showGameResult = (winner) => {
        gameover = true;
        if (winner?.player_no === 1) {
            gameMessage.textContent = "You Win!";
            gameController.player1Score += 1;
        } else if (winner?.player_no === 2) {
            gameMessage.textContent = "Computer Win!";
            gameController.player2Score += 1;
        } else {
            gameMessage.textContent = "It's a Tie!";
            gameController.tieCount += 1;
        }
        winner.win_fields.forEach(i => {
            fields[i].classList.add('change-bg');
        });

        quitGameButton.removeEventListener('click', showMenu);
        setTimeout(() => {
            winner.win_fields.forEach(i => {
                fields[i].classList.remove('change-bg');
            });
            gameController.clearBoard();
            gameoverModal.classList.remove('hide');
            renderGame();
            quitGameButton.addEventListener('click', showMenu);
        }, 3000);
    }

    const displayScores = () => {
        let playerXScore,
            playerOScore;
        if (gameController.player1.getSign() === 'x') {
            playerXScore = gameController.player1Score;
            playerOScore = gameController.player2Score;
        } else {
            playerXScore = gameController.player2Score;
            playerOScore = gameController.player1Score;
        }

        scoreX.textContent = playerXScore;
        scoreO.textContent = playerOScore;
        scoreTie.textContent = gameController.tieCount;
    }

    const gameStart = () => {
        const selectedSign = document.querySelector('input[name="player-sign"]:checked').value;
        const playerNameX = document.querySelector('.player-name.x');
        const playerNameO = document.querySelector('.player-name.o');
        difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        gameController = GameController(selectedSign);
        if (selectedSign === 'x') {
            playerNameX.textContent = 'You';
            playerNameO.textContent = 'Computer';
        } else {
            playerNameX.textContent = 'Computer';
            playerNameO.textContent = 'You';
        }
        showGame();
        makeComputerMove();
    }

    const enableFieldsEventListener = () => {
        fields.forEach((field, index) => {
            const boundSetField = setField.bind(field, index);
            field.addEventListener('click', boundSetField);
            field.__bountSetField = boundSetField;
        });
    }

    const disableFieldsEventListener = () => {
        fields.forEach((field) => {
            const boundSetField = field.__bountSetField;
            field.removeEventListener('click', boundSetField);
        });
    }

    const setField = (index) => {
        if (gameController.isPlayer2Turn() || gameover) {
            return;
        }

        const validMove = gameController.makeCurrentPlayerMove(index);
        if (validMove) {
            gameController.togglePlayer();
        }
        renderGame();
        makeComputerMove();
    }

    const makeComputerMove = () => {
        if (gameController.isPlayer1Turn() || gameover) {
            return;
        }

        disableFieldsEventListener();

        const fields = gameController.getAllField();
        const sign = gameController.getCurrentPlayer().getSign();
        const index = computerMove(difficulty, fields, sign);
        const validMove = gameController.makeCurrentPlayerMove(index);

        if (validMove) {
            gameController.togglePlayer();
        }
        setTimeout(() => {
            renderGame();
            enableFieldsEventListener();
        }, 1500)
    }

    enableFieldsEventListener();
    gameStartButton.addEventListener('click', gameStart);
    menuButton.addEventListener('click', showMenu);
    quitGameButton.addEventListener('click', showMenu);
    nextRoundButton.addEventListener('click', nextRound);
})();


function computerMove(difficulty, board, sign) {
    if (difficulty === 'easy') {
        return randomMove(board);
    }

    if (difficulty === 'medium') {
        if (Math.random() < 0.6) {
            return randomMove(board);
        }
        return findBestMove(board, sign);
    }

    if (difficulty === 'hard') {
        if (Math.random() < 0.15) {
            return randomMove(board);
        }
        return findBestMove(board, sign);
    }

    if (difficulty === 'unbeatable') {
        return findBestMove(board, sign);
    }
}

function randomMove(board) {
    const emptyCells = [];
    for (let i = 0; i < board.length; ++i) {
        if (board[i] !== 'x' && board[i] !== 'o') {
            emptyCells.push(i);
        }
    }
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    return emptyCells[randomIndex];
}

function minimax(board, depth, isMaxPlayer) {
    const result = evaluate(board);
    if (result === 'x') {
        return 10 - depth;
    } else if (result === 'o') {
        return -10 + depth;
    } else if (result === 'tie') {
        return 0;
    }

    if (isMaxPlayer) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; ++i) {
            if (board[i] === undefined) {
                board[i] = 'x';
                const score = minimax(board, depth + 1, false);
                board[i] = undefined;
                bestScore = Math.max(bestScore, score);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; ++i) {
            if (board[i] === undefined) {
                board[i] = 'o';
                const score = minimax(board, depth + 1, true);
                board[i] = undefined;
                bestScore = Math.min(bestScore, score);
            }
        }
        return bestScore;
    }
}

function evaluate(board) {
    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const win of wins) {
        if (win.every(i => board[i] === 'x')) {
            return 'x';
        }
        if (win.every(i => board[i] === 'o')) {
            return 'o';
        }
    }

    if (board.every(cell => cell !== undefined)) {
        return 'tie';
    }

    return null;
}

function findBestMove(board, sign) {
    let bestMove = -1;
    let isMaxPlayer = (sign !== 'x');
    let bestScore = isMaxPlayer? Infinity: -Infinity;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === undefined) {
            board[i] = sign;
            const score = minimax(board, 0, isMaxPlayer);
            board[i] = undefined;
            if (sign === 'x') {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            } else if (sign === 'o') {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
    }
    return bestMove;
}