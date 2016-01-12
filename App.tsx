import * as React from 'react';

class App extends React.Component<any, any> {
	
	game: Game;
	self = this;
	
	constructor() {
		super();
		this.game = new Game(this.refreshState.bind(this));
		this.state = {
			gameState: this.game.gameState
		}
	}
	
	handleCellClick(cellRef) {
		this.game.makeMove(cellRef.id);
	}
	
	refreshState() {
		this.setState({gameState: this.state.gameState})
	}
	
	resetGame() {
		this.game.resetGame();
	}

	render() {
		return (
			<div>
				<div id="page-wrapper">
					<h2><span id="pop">#</span>Tic Tac Toe</h2>
					<GameInfo 
						game={this.state.gameState}
						reset={() => this.resetGame()} />
					<Board 
						cellClick={(cellRef) => this.handleCellClick(cellRef)}
						game={this.state.gameState} />
				</div>
				<Foot />
			</div>
		)
	}
}

class GameInfo extends React.Component<any, any> {
	gameState;
	
	constructor(props) {
		super(props);
		this.gameState = this.props.game;
	}
	
	resetGame() {
		this.props.reset();
	}
	
	turnText(): string {
		let text = '';
		if (!this.gameState.winner) text = `Next move: ${this.gameState.currTurn}`;
		else if (this.gameState.winner == 'Draw') {
			text = 'Draw!!';
		} else {
			 text = `${this.gameState.winner} Wins!!`;
		}
		return text;
	}
	
	replay() {
		if (this.gameState.winner) {
			return <span id="replay" onClick={() => this.resetGame()}>Play again?</span>
		} else return <span></span>;
	}
	
	render() {
		return (
			<div>
				{this.turnText()}{this.replay()}
			</div>
		);
	}
}

class Board extends React.Component<any, any> {
	gameState;
	xImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png';
	oImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452554295/tictactoe-o_h3sgbo.png';
	
	constructor(props) {
		super(props);
		this.gameState = this.props.game;
	}
	
	cellClick(clickedCell) {
		this.props.cellClick(clickedCell);
	}
	
	checkContents(cell: string) {
		if (this.gameState.cellList[cell].xoro == 'X') return <img src={this.xImg} />;
		else if (this.gameState.cellList[cell].xoro == 'O') return <img src={this.oImg}/>;
		else return <div></div>;
	}
	
	render() {
		return (
			<div id="board-wrapper">
				<table id="game-board">
					<tr id="top-row">
						<td className="left-column cell-container" id="cell1" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell1")}</td>
						<td className="cell-container" id="cell2" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell2")}</td>
						<td className="right-column cell-container" id="cell3" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell3")}</td>
					</tr>
					<tr id="middle-row">
						<td className="left-column cell-container" id="cell4" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell4")}</td>
						<td className="cell-container" id="cell5" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell5")}</td>
						<td className="right-column cell-container" id="cell6" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell6")}</td>
					</tr>
					<tr id="bottom-row">
						<td className="left-column cell-container" id="cell7" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell7")}</td>
						<td className="cell-container" id="cell8" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell8")}</td>
						<td className="right-column cell-container" id="cell9" onClick={(e) => this.cellClick(e.target)}>{this.checkContents("cell9")}</td>
					</tr>
				</table>
			</div>
		);
	}
}

class Foot extends React.Component<any, any> {
	render() {
		return (
			<div id="foot">
				<div id="foot-text">
					Created with ♥ by <a href="https://github.com/Daynil/">Daynil</a> for <a href="http://www.freecodecamp.com/">FCC</a>
					<br/><a id="gh-link" href="https://github.com/Daynil/tictactoe">
					<i className="fa fa-github-square fa-lg"></i>
					Github repo
					</a>
				</div>
			</div>
		);
	}
}

interface MoveScore {
	move: string,
	score: number
}

class Agent {
	
	game;
	depthTracker = 0;
	recursiveDepth = 1000;
	
	constructor(game) {
		this.game = game;
	}
	
	private getLegalMoves(state): string[] {
		let legalMoves = [];
		for (let key in state.cellList) {
			if (state.cellList.hasOwnProperty(key)) {
				// Any empty space is a legal move.
				if (!state.cellList[key].xoro) legalMoves.push(key);
			}
		}
		return legalMoves;
	}
	
	private generateSuccessorState(prevState, move) {
		let state = JSON.parse(JSON.stringify(prevState)); // Clone to avoid reference issues
		state.cellList[move].xoro = state.currTurn;
		if (state.currTurn == "X") state.currTurn = "O";
		else state.currTurn = "X";
		return state;
	}
	
	public getNextMove(stateOrig): Promise<string> {
		let state = JSON.parse(JSON.stringify(stateOrig));
		//let moveUtility = this.getUtility(state, true);
		let movePromise = new Promise(
			resolve => {
				let moveScore = this.minimax(state);
				this.depthTracker = 0;
				resolve(moveScore.move);
			}
		)
		return movePromise;
	}
	
	private scoreGame(winner: string): number {
		let score = 0;
		if (winner == this.game.agentXorO) score = 10;
		else if (winner == this.game.playerXorO) score = -10;
		return score;
	}
	
	private getOptimalScore(minormax: string, movesScores: MoveScore[]): MoveScore {
		let optimal: MoveScore;
		let minTracker = 9999;
		let maxTracker = -9999;
		
		movesScores.forEach( moveScore => {
			if (minormax == 'max') {
				if (moveScore.score > maxTracker) {
					maxTracker = moveScore.score;
					optimal = moveScore;
				}
			} else {
				if (moveScore.score < minTracker) {
					minTracker = moveScore.score;
					optimal = moveScore;
				}
			}
		});
		
		return optimal;
	}
	
	private minimax(state): MoveScore {
		let gameCondition = this.game.checkWinCondition(state);
		if (gameCondition.state == 'Win' || gameCondition.state == 'Draw'){
			return {move: '', score: this.scoreGame(gameCondition.winner)};	
		} 
		let movesScores: MoveScore[] = [];  // An array of each move and the value it produces at the end of the game
		
		this.getLegalMoves(state).forEach( move => {
			let nextState = this.generateSuccessorState(state, move);
			let nextStateMS = this.minimax(nextState);
			movesScores.push({move: move, score: nextStateMS.score});
		});
		
		if (state.currTurn == this.game.agentXorO) {
			//console.log(movesScores);
			let bestMoveScore = this.getOptimalScore('max', movesScores);
			return bestMoveScore;
		} else {
			let bestMoveScore = this.getOptimalScore('min', movesScores);
			return bestMoveScore;
		}
	}
}

class Game {
	
	playerXorO = 'X';
	agentXorO = 'O';
	refreshState;
	agent: Agent;
	
	gameState = {
		currTurn: "X",
		winner: '',
		cellList: {
			['cell1']: { xoro: '' }, ['cell2']: { xoro: '' }, ['cell3']: { xoro: '' },
			['cell4']: { xoro: '' }, ['cell5']: { xoro: '' }, ['cell6']: { xoro: '' },
			['cell7']: { xoro: '' }, ['cell8']: { xoro: '' }, ['cell9']: { xoro: '' }
		}
	}
	
	constructor(refreshState) {
		this.refreshState = refreshState;
		this.agent = new Agent(this);
	}
	
	makeMove(cellID) {
		let clickedCell = this.gameState.cellList[cellID];
		if (!clickedCell.xoro) clickedCell.xoro = this.gameState.currTurn;
		this.nextTurn();
		this.refreshState();
	}
	
	nextTurn() {
		let gameCondition = this.checkWinCondition(this.gameState);
		if (gameCondition.state == 'Win') {
			this.gameState.winner = this.gameState.currTurn;
		} else if (gameCondition.state == 'Draw') {
			this.gameState.winner = 'Draw';
		} else {
			if (this.gameState.currTurn == "X") this.gameState.currTurn = "O";
			else this.gameState.currTurn = "X";
		}
		if (this.gameState.currTurn == this.agentXorO) {
			this.agent.getNextMove(this.gameState).then( agentMove => this.makeMove(agentMove) );
		}
	}
	
	resetGame() {
		this.gameState.winner = '';
		this.gameState.currTurn = 'X';
		for (let key in this.gameState.cellList) {
			if (this.gameState.cellList.hasOwnProperty(key)) {
				this.gameState.cellList[key].xoro = '';
			}
		}
		this.refreshState();
	}
	
	getMoveAt(state, position: string): string {
		return state.cellList[`cell${position}`].xoro;
	}
	
	checkRow(state, pos1: string, pos2: string, pos3:string): boolean {
		if (!this.getMoveAt(state, pos1)) return false;
		if (this.getMoveAt(state, pos1) == this.getMoveAt(state, pos2) &&
			this.getMoveAt(state, pos2) == this.getMoveAt(state, pos3)) return true;
		else return false;
	}
	
	checkWinCondition(state): {state: string, winner: string} {
		// Horizontal Wins
		if (this.checkRow(state, '1', '2', '3')) return {state: 'Win', winner: this.getMoveAt(state, '1')};
		if (this.checkRow(state, '4', '5', '6')) return {state: 'Win', winner: this.getMoveAt(state, '4')};
		if (this.checkRow(state, '7', '8', '9')) return {state: 'Win', winner: this.getMoveAt(state, '7')};
		
		// Vertical Wins
		if (this.checkRow(state, '1', '4', '7')) return {state: 'Win', winner: this.getMoveAt(state, '1')};
		if (this.checkRow(state, '2', '5', '8')) return {state: 'Win', winner: this.getMoveAt(state, '2')};
		if (this.checkRow(state, '3', '6', '9')) return {state: 'Win', winner: this.getMoveAt(state, '3')};
		
		// Diagonal Wins 
		if (this.checkRow(state, '1', '5', '9')) return {state: 'Win', winner: this.getMoveAt(state, '1')};
		if (this.checkRow(state, '3', '5', '7')) return {state: 'Win', winner: this.getMoveAt(state, '3')};
		
		for (let key in state.cellList) {
			// No win and empty spaces left on board, continue game
			if (state.cellList[key].xoro == '') return {state: 'None', winner: ''};
		}
		// No win, no empty spaces left on board, draw
		return {state: 'Draw', winner: ''};
	}
	
}

export default App;