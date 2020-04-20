import React, { Component } from 'react';
import Grid from './Grid';
import PieceCollection from './PieceCollection';
import NextPiece from './NextPiece';
import TouchAndHelpers from './TouchAndHelpers';

import LevelAndLine from './LevelAndLine';
import TimeAndScore from './TimeAndScore';

class Game extends Component {
	state = {
		grid: null,
		gridHeight: 20,
		gridWidth: 10,
		piece: null,
		nbrCleanLine: 0,
		lvl: 1,
		nextPieceIndex: null,
		isLostGame: false,
		options: {},
		score: 0,
		linePerLvl: 5
	};

	componentDidMount() {
		let options = JSON.parse(localStorage.getItem('tetris_options'));
		if (options === null || options === '') {
			options = TouchAndHelpers;
		}
		this.setState({ options }, () => {
			this.initGame();
		});
	}

	componentWillUnmount() {
		window.removeEventListener('keyup', this.keyupActions);
		window.removeEventListener('keydown', this.keydownActions);
	}

	executeKeyCode = (keyCode) => {
		switch (keyCode) {
			case this.state.options.touch['right']:
				this.pieceMoveToAxis(1);
				break;
			case this.state.options.touch['left']:
				this.pieceMoveToAxis(-1);
				break;
			case this.state.options.touch['bottom']:
				this.pieceMoveToYAxis(1);
				break;
			case this.state.options.touch['rotateRight']:
				this.rotatePiece('right');
				break;
			case this.state.options.touch['rotateLeft']:
				this.rotatePiece('left');
				break;
			default:
				break;
		}
	};

	keyupActions = (e) => {
		this.multiple_keys_pressed = false;
		let index = this.key_pressed.indexOf(e.keyCode);
		if (index !== -1) {
			this.key_pressed.splice(index, 1);
		}
	};

	keydownActions = (e) => {
		if (this.key_pressed.indexOf(e.keyCode) === -1) {
			this.key_pressed.push(e.keyCode);
		}
		if (this.key_pressed.length > 1) {
			this.key_pressed.forEach((keyCode, index) => {
				if (this.multiple_keys_pressed === false && index === 0) {
					this.multiple_keys_pressed = true;
				} else {
					this.executeKeyCode(keyCode);
				}
			});
		} else {
			this.executeKeyCode(this.key_pressed[0]);
		}
	};

	initGame = () => {
		this.baseIntervalTimer = 1000;
		this.globalTimer = 0;

		setInterval(() => {
			this.globalTimer++;
		}, 1000);

		this.key_pressed = [];
		this.multiple_keys_pressed = false;
		window.addEventListener('keyup', this.keyupActions);
		window.addEventListener('keydown', this.keydownActions);
		this.setState(
			{
				grid: this.buildGrid(),
				nextPieceIndex: this.generateNextPieceIndex(),
				nbrCleanLine: 0,
				lvl: 1,
				isLostGame: false
			},
			() => {
				this.generatePiece();
				this.launchTimer();
			}
		);
		this.buildGrid();
	};

	lostGame = () => {
		//Mettre fin au jeu
		clearInterval(this.timer);
		this.setState({ isLostGame: true });
		window.removeEventListener('keyup', this.keyupActions);
		window.removeEventListener('keydown', this.keydownActions);
	};

	//Timer Fonction
	launchTimer = () => {
		this.timer = setInterval(() => {
			this.pieceMoveToYAxis(1);
		}, this.convertLvlToTime());
	};

	convertLvlToTime = () => {
		let interval = this.baseIntervalTimer - (this.state.lvl - 1) * 35;
		return interval < 100 ? 100 : interval;
	};

	buildGrid = () => {
		let grid = [];
		for (let y = 0; y < this.state.gridHeight; y++) {
			let line = [];
			for (let x = 0; x < this.state.gridWidth; x++) {
				line.push(0);
			}
			grid.push(line);
		}
		return grid;
	};

	mergePieceToGrid = () => {
		let score = this.state.score;
		let lvl = this.state.lvl;
		let lvlChanged = false;
		const virtualGrid = this.state.grid;
		this.state.piece.mergeData.forEach((element) => {
			const [ y, x ] = element.split('-');
			virtualGrid[y][x] = this.state.piece.color;
		});
		let nbrCleanLine = this.state.nbrCleanLine;
		let { cleanGrid, nbrLineCompleted } = this.cleanGrid(virtualGrid);
		nbrCleanLine += nbrLineCompleted;

		if (nbrLineCompleted > 0) {
			//update score
			score += parseInt(Math.pow(nbrLineCompleted, 2) * lvl * this.convertLvlToTime());

			//changement of level
			if (nbrCleanLine >= this.state.linePerLvl) {
				nbrCleanLine = 0;
				lvl++;
				lvlChanged = true;
				clearInterval(this.timer);
			}
		}
		this.setState({ grid: cleanGrid, piece: null, nbrCleanLine: nbrCleanLine, lvl, score }, () => {
			this.generatePiece();
			if (lvlChanged) {
				this.launchTimer();
			}
		});
	};

	generateNextPieceIndex() {
		return Math.floor(Math.random() * PieceCollection.length);
	}

	generatePiece = () => {
		let piece = {};
		piece.posY = 0;
		let indexPieceCollection = this.state.nextPieceIndex;
		piece.grid = PieceCollection[indexPieceCollection];
		piece.posX = Math.floor((this.state.gridWidth - piece.grid[0].length) / 2);
		if (piece.grid[0][0] === 0) {
			piece.posY--;
		}
		piece.mergeData = [];
		piece.color = indexPieceCollection + 1;
		let coordinate = this.pieceCanBeMove(piece);
		if (coordinate !== false) {
			piece.mergeData = coordinate;
			this.setState({ piece, nextPieceIndex: this.generateNextPieceIndex() });
		} else {
			this.lostGame();
		}
	};

	pieceCanBeMove = (piece) => {
		let coordinate = [];
		for (let y = 0; y < piece.grid.length; y++) {
			for (let x = 0; x < piece.grid[0].length; x++) {
				if (piece.grid[y][x] > 0) {
					if (this.state.grid[y + piece.posY] === undefined) {
						return false; //out of range Y
					}
					if (this.state.grid[y + piece.posY][x + piece.posX] === undefined) {
						return false; //out of range X
					}
					if (this.state.grid[y + piece.posY][x + piece.posX] > 0) {
						return false;
					}
					coordinate.push(y + piece.posY + '-' + (x + piece.posX));
				}
			}
		}
		return coordinate;
	};

	pieceMoveToAxis = (deltaX) => {
		let piece = { ...this.state.piece };
		if (piece === null) {
			return false;
		}
		piece.posX += deltaX;

		let coordinate = this.pieceCanBeMove(piece);
		if (coordinate !== false) {
			piece.mergeData = coordinate;
			this.setState({ piece });
		}
	};

	pieceMoveToYAxis = (deltaY) => {
		let piece = { ...this.state.piece };
		if (piece === null) {
			return false;
		}
		piece.posY += deltaY;
		let coordinate = this.pieceCanBeMove(piece);
		if (coordinate !== false) {
			piece.mergeData = coordinate;
			this.setState({ piece });
		} else {
			this.mergePieceToGrid();
		}
	};

	rotatePiece = (sense) => {
		let piece = { ...this.state.piece };
		if (piece === null) {
			return false;
		}
		let newGrid = [];
		if (sense === 'right') {
			for (let x = 0; x < piece.grid[0].length; x++) {
				let line = [];
				for (let y = piece.grid.length - 1; y > -1; y--) {
					line.push(piece.grid[y][x]);
				}
				newGrid.push(line);
			}
		} else if (sense === 'left') {
			for (let x = piece.grid[0].length - 1; x > -1; x--) {
				let line = [];
				for (let y = 0; y < piece.grid.length; y++) {
					line.push(piece.grid[y][x]);
				}
				newGrid.push(line);
			}
		}
		piece.grid = newGrid;
		let coordinate = this.pieceCanBeMove(piece);
		if (coordinate !== false) {
			piece.mergeData = coordinate;
			this.setState({ piece });
		} else {
			let isPositionUpdate = false;
			//pas de rotation
			if (piece.posX < 0) {
				piece.posX = 0;
				isPositionUpdate = true;
			} else if (piece.grid[0].length + piece.posX > this.state.gridWidth) {
				piece.posX = this.state.gridWidth - piece.grid[0].length;
				isPositionUpdate = true;
			} else if (piece.posY < 0) {
				piece.posY = 0;
				isPositionUpdate = true;
			}
			if (isPositionUpdate) {
				coordinate = this.pieceCanBeMove(piece);
				if (coordinate !== false) {
					piece.mergeData = coordinate;
					this.setState({ piece });
				}
			}
		}
	};

	cleanGrid = (grid) => {
		let cleanGrid = [];
		let nbrLineCompleted = 0;
		for (let y = 0; y < this.state.gridHeight; y++) {
			let lineCompleted = true;
			for (let x = 0; x < this.state.gridWidth; x++) {
				if (grid[y][x] === 0) {
					lineCompleted = false;
				}
			}

			if (lineCompleted === false) {
				cleanGrid.push(grid[y]);
			}
		}
		nbrLineCompleted = this.state.gridHeight - cleanGrid.length;
		for (let i = 0; i < nbrLineCompleted; i++) {
			cleanGrid.unshift(this.makeCleanLine(this.state.gridWidth));
		}
		return { cleanGrid, nbrLineCompleted };
	};

	makeCleanLine = (width) => {
		let line = [];
		for (let x = 0; x < width; x++) {
			line.push(0);
		}
		return line;
	};

	render() {
		if (this.state.isLostGame) {
			return (
				<div id="wrapper_lost_game">
					<h2>Game Over</h2>
					<p className="score">Score : {this.state.score}</p>
					<div id="menu">
						<button onClick={() => this.props.actions.launchMenu()}>Back</button>
						<button onClick={() => this.initGame()}>Play again</button>
					</div>
				</div>
			);
		}

		return (
			<div id="wrapper_grid">
				<LevelAndLine lvl={this.state.lvl} line={this.state.nbrCleanLine} linePerLvl={this.state.linePerLvl} />
				{this.state.nextPieceIndex !== null && (
					<NextPiece
						grid={PieceCollection[this.state.nextPieceIndex]}
						color={this.state.nextPieceIndex + 1}
					/>
				)}
				{this.state.grid !== null && (
					<Grid
						grid={this.state.grid}
						piece={this.state.piece}
						projection={this.state.options.helpers['projection']}
					/>
				)}
				{this.state.isLostGame === true && (
					<button onClick={() => this.props.actions.launchMenu()}>Back</button>
				)}
				<TimeAndScore score={this.state.score} globalTimer={this.globalTimer} />
			</div>
		);
	}
}

export default Game;
