var agentXorO = '';
var playerXorO = '';

self.addEventListener('message', function(e) {
	// Main thread passes in current gameState
	var gameState = e.data;
	playerXorO = gameState.playerXorO;
	agentXorO = gameState.agentXorO;
	getNextMove(gameState);

});

function getNextMove(gameState) {
	var state = JSON.parse(JSON.stringify(gameState));
	if (getLegalMoves(gameState).length == 9) {
		// No need to think on the first turn.
		postMessage('cell1');
		return;
	}
	var movePromise = new Promise(
		resolve => {
			var moveScore = minimax(state);
			resolve(moveScore.move);
		}
	).then(
		move => postMessage(move)
	);
}

// Main recursive AI function

function minimax(state) {
	var gameCondition = checkWinCondition(state);
	if (gameCondition.state == 'Win' || gameCondition.state == 'Draw'){
		return {move: '', score: scoreGame(gameCondition.winner)};	
	} 
	var movesScores = [];  // An array of each move and the value it produces at the end of the game
	
	getLegalMoves(state).forEach( move => {
		var nextState = generateSuccessorState(state, move);
		var nextStateMS = minimax(nextState);
		movesScores.push({move: move, score: nextStateMS.score});
	});
	
	if (state.currTurn == agentXorO) {
		//console.log(movesScores);
		var bestMoveScore = getOptimalScore('max', movesScores);
		return bestMoveScore;
	} else {
		var bestMoveScore = getOptimalScore('min', movesScores);
		return bestMoveScore;
	}
}

// AI helper functions

function getLegalMoves(state) {
	var legalMoves = [];
	for (var key in state.cellList) {
		if (state.cellList.hasOwnProperty(key)) {
			// Any empty space is a legal move.
			if (!state.cellList[key].xoro) legalMoves.push(key);
		}
	}
	return legalMoves;
}

function generateSuccessorState(prevState, move) {
	var state = JSON.parse(JSON.stringify(prevState)); // Clone to avoid reference issues
	state.cellList[move].xoro = state.currTurn;
	if (state.currTurn == "X") state.currTurn = "O";
	else state.currTurn = "X";
	return state;
}

function scoreGame(winner) {
	var score = 0;
	if (winner == agentXorO) score = 10;
	else if (winner == playerXorO) score = -10;
	return score;
}

function getOptimalScore(minormax, movesScores) {
	var optimal;
	var minTracker = 9999;
	var maxTracker = -9999;
	
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

// Game helper functions

function checkWinCondition(state) {
	// Horizontal Wins
	if (checkRow(state, '1', '2', '3')) return {state: 'Win', winner: getMoveAt(state, '1')};
	if (checkRow(state, '4', '5', '6')) return {state: 'Win', winner: getMoveAt(state, '4')};
	if (checkRow(state, '7', '8', '9')) return {state: 'Win', winner: getMoveAt(state, '7')};
	
	// Vertical Wins
	if (checkRow(state, '1', '4', '7')) return {state: 'Win', winner: getMoveAt(state, '1')};
	if (checkRow(state, '2', '5', '8')) return {state: 'Win', winner: getMoveAt(state, '2')};
	if (checkRow(state, '3', '6', '9')) return {state: 'Win', winner: getMoveAt(state, '3')};
	
	// Diagonal Wins 
	if (checkRow(state, '1', '5', '9')) return {state: 'Win', winner: getMoveAt(state, '1')};
	if (checkRow(state, '3', '5', '7')) return {state: 'Win', winner: getMoveAt(state, '3')};
	
	for (var key in state.cellList) {
		// No win and empty spaces left on board, continue game
		if (state.cellList[key].xoro == '') return {state: 'None', winner: ''};
	}
	// No win, no empty spaces left on board, draw
	return {state: 'Draw', winner: ''};
}

function getMoveAt(state, position) {
	return state.cellList[`cell${position}`].xoro;
}

function checkRow(state, pos1, pos2, pos3) {
	if (!getMoveAt(state, pos1)) return false;
	if (getMoveAt(state, pos1) == getMoveAt(state, pos2) &&
		getMoveAt(state, pos2) == getMoveAt(state, pos3)) return true;
	else return false;
}