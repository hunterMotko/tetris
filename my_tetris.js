/** @format */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const canvasNext = document.getElementById('next');
const ctxNext = canvasNext.getContext('2d');
const canvasHold = document.getElementById('hold');
const ctxHold = canvasHold.getContext('2d');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const music = new Audio('assets/korobeiniki.mp3');
music.loop = true;
let requestId = null;
let time = null;

const moves = {
	[KEY.LEFT]: piece => ({ ...piece, x: piece.x - 1 }),
	[KEY.RIGHT]: piece => ({ ...piece, x: piece.x + 1 }),
	[KEY.DOWN]: piece => ({ ...piece, y: piece.y + 1 }),
	[KEY.SPACE]: piece => ({ ...piece, y: piece.y + 1 }),
	[KEY.UP]: piece => board.rotate(piece, ROTATION.RIGHT),
	[KEY.Z]: piece => board.rotate(piece, ROTATION.LEFT)
};

let board = new GameBoard(ctx, ctxNext, ctxHold);

initNext();
initHold();
function initNext() {
	ctxNext.canvas.width = 12 * BLOCK_SIZE;
	ctxNext.canvas.height = 3.4 * BLOCK_SIZE;
	ctxNext.scale(BLOCK_SIZE, BLOCK_SIZE);
}

function initHold() {
	ctxHold.canvas.width = 4 * BLOCK_SIZE;
	ctxHold.canvas.height = 3.4 * BLOCK_SIZE;
	ctxHold.scale(BLOCK_SIZE, BLOCK_SIZE);
	pauseBtn.style.display = 'none';
}

function addEventListener() {
	document.removeEventListener('keydown', handleKeyPress);
	document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
	if (event.key === KEY.ESC) {
		pause();
	}
	if (event.key === KEY.C) {
		board.hold();
	}
	if (moves[event.key]) {
		event.preventDefault();
		// Get new state
		let p = moves[event.key](board.piece);
		if (event.key === KEY.SPACE) {
			while (board.valid(p)) {
				board.score += POINTS.HARD_DROP;
				board.piece.move(p);
				p = moves[KEY.DOWN](board.piece);
			}
			board.piece.hardDrop();
		} else if (board.valid(p)) {
			board.piece.move(p);
			if (event.key === KEY.DOWN && pauseBtn.style.display === 'block') {
				board.score += POINTS.SOFT_DROP;
			}
		}
	}
}

function resetGame() {
	board.score = 0;
	board.lines = 0;
	board.level = 1;
	board.reset();
	time = { start: performance.now(), elapsed: 0, level: LEVEL[board.level] };
}

function play() {
	addEventListener();

	if (playBtn.style.display === '') {
		resetGame();
	}

	if (requestId) {
		cancelAnimationFrame(requestId);
	}

	animate();
	playBtn.style.display = 'none';
	pauseBtn.style.display = 'block';
}

function animate(now = 0) {
	time.elapsed = now - time.start;
	updateScore();
	if (time.elapsed > time.level) {
		time.start = now;
		if (!board.drop()) {
			gameOver();
			return;
		}
	}
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	board.draw();
	requestId = requestAnimationFrame(animate);
}

function gameOver() {
	cancelAnimationFrame(requestId);

	ctx.fillStyle = 'black';
	ctx.fillRect(1, 3, 8, 1.2);
	ctx.font = '1px Arial';
	ctx.fillStyle = 'red';
	ctx.fillText('GAME OVER', 1.8, 4);

	pauseBtn.style.display = 'none';
	playBtn.style.display = '';
	resetGame();
}

function updateScore() {
	document.getElementById('score').textContent = board.score;
	document.getElementById('lines').textContent = board.lines;
	document.getElementById('level').textContent = board.level;
}

function pause() {
	if (!requestId) {
		playBtn.style.display = 'none';
		pauseBtn.style.display = 'block';
		animate();
		return;
	}

	cancelAnimationFrame(requestId);
	requestId = null;

	ctx.fillStyle = 'black';
	ctx.fillRect(1, 3, 8, 1.2);
	ctx.font = '1px Arial';
	ctx.fillStyle = 'yellow';
	ctx.fillText('PAUSED', 3, 4);
	playBtn.style.display = 'block';
	pauseBtn.style.display = 'none';
}

playBtn.addEventListener('click', () => {
	play();
	music.play();
});

pauseBtn.addEventListener('click', () => {
	pause();
	music.pause();
});
