import * as React from 'react';
var Dialog = require('material-ui/lib/dialog');
var AIWorker = require('worker!./agent-webworker.js');

class App extends React.Component<any, any> {
	
	game: Game;
	
	constructor() {
		super();
		this.game = new Game(this.refreshState.bind(this));
		this.state = {
			gameState: this.game.gameState
		}
	}
	
	handleCellClick(cellRef) {
		if (!(this.state.gameState.currTurn == this.state.gameState.playerXorO) 
			|| this.game.gameState.winner != '' 
			|| this.game.gameState.cellList[cellRef.id] == undefined) return;
		this.game.makeMove(cellRef.id);
	}
	
	refreshState() {
		this.setState({gameState: this.state.gameState})
	}
	
	resetGame() {
		this.game.resetGame();
	}
	
	setXorO(selection: string) {
		this.game.setXorO(selection);
	}
	
	replay() {
		if (this.state.gameState.winner) {
			let buttonText = '';
			if (this.state.gameState.winner == 'Draw') buttonText = "It's a draw!"
			else buttonText = `${this.state.gameState.winner} wins!`;
			return <span id="replay" 
						onClick={() => this.resetGame()}>{buttonText} Play again?</span>
		} else return <span></span>;
	}

	render() {
		return (
			<div>
				<div id="page-wrapper">
					<h2><span id="pop">#</span>Tic Tac Toe</h2>
					<GameInfo 
						game={this.state.gameState}
						reset={() => this.resetGame()} 
						setXorO={(selection) => this.setXorO(selection)}/>
					<Board 
						cellClick={(cellRef) => this.handleCellClick(cellRef)}
						game={this.state.gameState} />
					<div>{this.replay()}</div>
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
		this.state = {
			open: true
		};
	}
	
	handleOpen() {
		//this.setState({open: true});
	}
	
	handleClose(selection: string) {
		//this.setState({open: false});
		this.props.setXorO(selection);
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
	
	getShape(which: string) {
		switch (which) {
			case 'player':
				if (this.gameState.playerXorO == 'X') return (
					<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png" 
						className="shapeDisplay"/>
				); else if (this.gameState.playerXorO == 'O') return (
					<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452554295/tictactoe-o_h3sgbo.png" 
						className="shapeDisplay"/>
				);
				break;
			case 'agent':
				if (this.gameState.agentXorO == 'X') return (
					<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png" 
						className="shapeDisplay"/>
				); else if (this.gameState.agentXorO == 'O') return (
					<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452554295/tictactoe-o_h3sgbo.png" 
						className="shapeDisplay"/>
				);
				break;
		}
	}
	
	getTurn(which: string): string {
		let className = 'playerDiv';
		switch (which) {
			case 'player':
				if (this.gameState.currTurn == this.gameState.playerXorO) className += ' activePlayer';
				break;
			case 'agent':
				if (this.gameState.currTurn == this.gameState.agentXorO) className += ' activePlayer';
		}
		return className;
	}
	
	loading() {
		if (this.gameState.loading) return <i className="fa fa-cog fa-spin"></i>
	}
	
	render() {
		const actions = [
			<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png" 
				className="dialogShape"
				onClick={() => this.handleClose('X')}/>,
			<img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452554295/tictactoe-o_h3sgbo.png"
				className="dialogShape"
				onClick={() => this.handleClose('O')}/>
		];
		return (
			<div>
				<div className={this.getTurn('player')}>Player: {this.getShape('player')}</div>
				<div className={this.getTurn('agent')} id="agentDiv">Computer: {this.getShape('agent')} {this.loading()}</div>
				<Dialog
					title="Pick Your Shape"
					actions={actions}
					modal={false}
					open={this.gameState.playerXorO == ''}
					onRequestClose={() => this.handleClose('')}>
					Remember, <img src="http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png" 
								className="shapeDisplay"/> always moves first!
				</Dialog>
			</div>
		);
	}
}

class Board extends React.Component<any, any> {
	gameState;
	xImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452555694/tictactoe-x_ni4rto.png';
	//xRedImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452656591/tictactoe-x-red_nvretc.png';
	oImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452554295/tictactoe-o_h3sgbo.png';
	//oRedImg = 'http://res.cloudinary.com/dz9rf4hwz/image/upload/v1452656591/tictactoe-o-red_fjfl5n.png';
	
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
		//else if (this.gameState.cellList[cell].xoro == 'X' && this.gameState.winner == 'X') return <img src={this.xRedImg} />;
		//else if (this.gameState.cellList[cell].xoro == 'O' && this.gameState.winner == 'O') return <img src={this.oRedImg} />;
		else return <div></div>;
	}
	
	render() {
		//TODO canvas for winstrike?
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
				<div id="win-strike-container" hidden={true}>
					
				</div>
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
					<br/><a id="gh-link" href="https://github.com/Daynil/tictactoe-react">
					<i className="fa fa-github-square fa-lg"></i>
					Github repo
					</a>
				</div>
			</div>
		);
	}
}

class Game {
	
	refreshState;
	agentWorker;
	
	gameState = {
		playerXorO: '',
		agentXorO: '',
		currTurn: "X",
		loading: false,
		winner: '',
		cellList: {
			['cell1']: { xoro: '' }, ['cell2']: { xoro: '' }, ['cell3']: { xoro: '' },
			['cell4']: { xoro: '' }, ['cell5']: { xoro: '' }, ['cell6']: { xoro: '' },
			['cell7']: { xoro: '' }, ['cell8']: { xoro: '' }, ['cell9']: { xoro: '' }
		}
	}
	
	constructor(refreshState) {
		this.refreshState = refreshState;
		this.agentWorker = new AIWorker();
		this.agentWorker.onmessage = (e) => {
			// Worker returns single string cell as next move
			this.makeMove(e.data);
		}
	}
	
	setXorO(selection: string) {
		this.gameState.playerXorO = selection;
		if (this.gameState.playerXorO == 'X') this.gameState.agentXorO = 'O';
		else this.gameState.agentXorO = 'X';
		this.refreshState();
		if (this.gameState.currTurn == this.gameState.agentXorO) {
			this.requestAgentMove();
		}
	}
	
	makeMove(cellID) {
		if (this.gameState.loading) this.gameState.loading = false;
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
		if (this.gameState.currTurn == this.gameState.agentXorO && gameCondition.state == 'None') {
			// Send agent gameState in order to get next move
			this.requestAgentMove();
		}
	}
	
	requestAgentMove() {
		this.agentWorker.postMessage( JSON.parse(JSON.stringify(this.gameState)) );
		this.gameState.loading = true;
		this.refreshState();
	}
	
	resetGame() {
		this.gameState.winner = '';
		this.gameState.currTurn = 'X';
		this.gameState.playerXorO = '';
		this.gameState.agentXorO = '';
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