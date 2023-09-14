"use strict";

(function() {
	function GameBoard(){
		const DEFAULT_GAMEBOARD = ['', '', '', '', '', '', '', '', ''];
		const WIN_COMBOS = [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[0, 4, 8],
			[2, 4, 6],
			[0, 3, 6],
			[1, 4, 7],
			[2, 5, 8]
		];

		let gameBoard = DEFAULT_GAMEBOARD;

		const checkBoard = (ply1, ply2) => {
			const len = WIN_COMBOS.length;
			for (let i = 0; i < len; i++) {
				const win_indices = WIN_COMBOS[i];
				if (win_indices.every(index => gameBoard[index] === ply1)){
					return ply1;
				} else if (win_indices.every(index => gameBoard[index] === ply2)){
					return ply2;
				}
			}
			if (gameBoard.every(field => field !== '')){
				return 'draw';
			}
		}

		const resetGameBoard = () => {
			gameBoard = DEFAULT_GAMEBOARD;
		};

		const getBoard = () => gameBoard;

		const getField = (index) => gameBoard[index];

		const setField = (index, player) => {
			if (gameBoard[index] === ''){
				gameBoard[index] = player.getSign();
			}
		}

		return {resetGameBoard, getBoard, getField, setField, checkBoard};
	}

	function Player(sign) {
		let _sign = sign;
		const getSign = () => _sign;
		const setSign = (sign) => {
			_sign = sign;
		};

		return { getSign, setSign };
	}

	function CurrentPlayerTurn(player1, player2){
		const _player1 = player1;
		const _player2 = player2;
		let currentTurn = player1;
		const get = () => currentTurn;
		const toggle = () => {
			if (currentTurn.getSign() === _player1.getSign()){
				currentTurn = _player2;
			} else {
				currentTurn = _player1;
			}
		};
		return {toggle, get};
	}

	function displayContoller(){
		const player1 = Player('x');
		const player2 = Player('o');
		let currentPlayerTurn = CurrentPlayerTurn(player1, player2);
		const _gameFields = document.querySelectorAll('.field');
		const player_x = document.querySelector('.player-x');
		const player_o = document.querySelector('.player-o');
		const gameBoard = GameBoard();

		function checkWinner(){
			const POP_UP_DELAY = 200;
			const ply1 = player1.getSign();
			const ply2 = player2.getSign();
			const check = gameBoard.checkBoard(ply1, ply2);

			if (check === ply1){
				setTimeout(
					() => {
						alert('player ' + ply1 + ' win!');
					},
					POP_UP_DELAY
				);
			} else if (check === ply2){
				setTimeout(
					() => {
						alert('player ' + ply2 + ' win!');
					},
					POP_UP_DELAY
				);
			} else if (check === 'draw'){
				setTimeout(
					() => {
						alert('Draw!');
					},
					POP_UP_DELAY
				);
			}
		}

		function render() {
			_gameFields.forEach((field, index) => {
				field.textContent = gameBoard.getBoard()[index];
				if (field.textContent !== ''){
					field.disabled = true;
				}
			});
		}

		function playerMove(index){
			const sign = currentPlayerTurn.get();
			gameBoard.setField(index, sign);
			render();
			if (sign.getSign() === player1.getSign()){
				player_x.classList.add('turn');
				player_o.classList.remove('turn');
			} else {
				player_o.classList.add('turn');
				player_x.classList.remove('turn');
			}
			checkWinner();
			currentPlayerTurn.toggle();
		}

		_gameFields.forEach((field, index) => {
			field.addEventListener('click', playerMove.bind(field, index));
		});
	}
	displayContoller();
})();
