/** @format */

class GameBoard {
	constructor(ctx, ctxNext) {
		this.ctx = ctx;
		this.ctxNext = ctxNext;
		this.ctxHold = ctxHold;
		this.init();
		this.score = 0;
		this.lines = 0;
		this.level = 1;
		this.holdPiece = null;
		this.canHold = true;
		this.q = new Queue();
	}
	init() {
		this.ctx.scale(BLOCK_SIZE, BLOCK_SIZE);
	}

	reset() {
		this.grid = this.getEmptyGrid();
		this.piece = new Piece(this.ctx);
		this.holdPiece = null;
		this.q.enqueue(new Piece(this.ctxNext));
		this.q.enqueue(new Piece(this.ctxNext));
		this.q.enqueue(new Piece(this.ctxNext));

		this.piece.setStartingPosition();
		this.getNewPiece();
	}

	getNewPiece() {
		const { width, height } = this.ctxNext.canvas;
		this.next = this.q.dequeue();
		this.q.enqueue(new Piece(this.ctxNext));
		this.ctxNext.clearRect(0, 0, width, height);
		this.next.draw();
	}

	draw() {
		this.piece.draw();
		this.drawBoard();
	}

	drop() {
		let p = moves[KEY.DOWN](this.piece);
		if (this.valid(p)) {
			this.piece.move(p);
		} else {
			this.freeze();
			this.clearLines();
			if (this.piece.y === 0) {
				return false;
			}
			this.piece = this.next;
			this.piece.ctx = this.ctx;
			this.piece.setStartingPosition();
			this.getNewPiece();
		}
		return true;
	}

	hold() {
		const { width, height } = this.ctxHold.canvas;

		if (this.holdPiece === null && this.canHold) {
			this.holdPiece = this.piece;
			this.holdPiece.x = 0;
			this.holdPiece.y = 0;
			this.holdPiece.ctx = this.ctxHold;
			this.piece = this.next;
			this.piece.ctx = this.ctx;
			this.piece.setStartingPosition();
			this.getNewPiece();
			this.ctxHold.clearRect(0, 0, width, height);
			this.holdPiece.draw();
		} else if (this.canHold) {
			let temp = this.piece;
			this.piece = this.holdPiece;
			this.holdPiece = temp;
			this.holdPiece.x = 0;
			this.holdPiece.y = 0;
			this.holdPiece.ctx = this.ctxHold;
			this.piece.ctx = this.ctx;
			this.piece.setStartingPosition();
			this.getNewPiece();
			this.ctxHold.clearRect(0, 0, width, height);
			this.holdPiece.draw();
		}
	}

	clearLines() {
		let lines = 0;

		this.grid.forEach((row, y) => {
			if (row.every(value => value > 0)) {
				lines++;
				this.grid.splice(y, 1);
				this.grid.unshift(Array(COLS).fill(0));
			}
		});

		if (lines > 0) {
			this.score += this.getLinesClearedPoints(lines);
			this.lines += lines;

			if (this.lines >= LINES_PER_LEVEL) {
				this.level++;
				this.lines -= LINES_PER_LEVEL;
				time.level = LEVEL[this.level];
			}
		}
	}

	valid(piece) {
		return piece.shape.every((row, dy) => {
			return row.every((value, dx) => {
				let x = piece.x + dx;
				let y = piece.y + dy;
				return (
					value === 0 || (this.isInsideWalls(x, y) && this.notOccupied(x, y))
				);
			});
		});
	}

	freeze() {
		this.piece.shape.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value > 0) {
					this.grid[y + this.piece.y][x + this.piece.x] = value;
				}
			});
		});
	}

	drawBoard() {
		this.grid.forEach((row, y) => {
			row.forEach((value, x) => {
				if (value > 0) {
					this.ctx.fillStyle = COLORS[value];
					this.ctx.fillRect(x, y, 1, 1);
				}
			});
		});
	}

	getEmptyGrid() {
		return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
	}

	isInsideWalls(x, y) {
		return x >= 0 && x < COLS && y <= ROWS;
	}

	notOccupied(x, y) {
		return this.grid[y] && this.grid[y][x] === 0;
	}

	rotate(piece, direction) {
		let p = JSON.parse(JSON.stringify(piece));
		if (!piece.hardDropped) {
			for (let y = 0; y < p.shape.length; ++y) {
				for (let x = 0; x < y; ++x) {
					[p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
				}
			}
			if (direction === ROTATION.RIGHT) {
				p.shape.forEach(row => row.reverse());
			} else if (direction === ROTATION.LEFT) {
				p.shape.reverse();
			}
		}

		return p;
	}

	getLinesClearedPoints(lines) {
		const lineClearPoints =
			lines === 1
				? POINTS.SINGLE
				: lines === 2
				? POINTS.DOUBLE
				: lines === 3
				? POINTS.TRIPLE
				: lines === 4
				? POINTS.TETRIS
				: 0;
		return (this.level + 1) * lineClearPoints;
	}
}
