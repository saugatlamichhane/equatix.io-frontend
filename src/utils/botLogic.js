// botLogic.js

const VALID_EDGES = new Set([
  "1-1:1-2","1-2:1-3","1-3:1-4","1-4:1-5",
  "2-1:2-2","2-2:2-3","2-3:2-4","2-4:2-5",
  "3-1:3-2","3-2:3-3","3-3:3-4","3-4:3-5",
  "4-1:4-2","4-2:4-3","4-3:4-4","4-4:4-5",
  "5-1:5-2","5-2:5-3","5-3:5-4","5-4:5-5",
  "1-1:2-1","1-2:2-2","1-3:2-3","1-4:2-4","1-5:2-5",
  "2-1:3-1","2-2:3-2","2-3:3-3","2-4:3-4","2-5:3-5",
  "3-1:4-1","3-2:4-2","3-3:4-3","3-4:4-4","3-5:4-5",
  "4-1:5-1","4-2:5-2","4-3:5-3","4-4:5-4","4-5:5-5",
  "1-1:2-2","2-2:3-3","3-3:4-4","4-4:5-5",
  "1-3:2-4","2-4:3-5","3-1:4-2","4-2:5-3",
  "1-3:2-2","2-2:3-1","1-5:2-4","2-4:3-3",
  "3-3:4-2","4-2:5-1","3-5:4-4","4-4:5-3"
]);

function edgeKey(a, b) {
  const [p1, p2] = [a, b].sort((x, y) => x.row === y.row ? x.col - y.col : x.row - y.row);
  return `${p1.row}-${p1.col}:${p2.row}-${p2.col}`;
}

function isAdjacent(a, b) {
  return VALID_EDGES.has(edgeKey(a, b));
}

function isOccupied(board, pos) {
  return board.goats.some((g) => g.row === pos.row && g.col === pos.col) ||
         board.tigers.some((t) => t.row === pos.row && t.col === pos.col);
}

// --- Goat moves ---
export function getGoatMoves(board, goat) {
  const moves = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const to = { row: goat.row + dr, col: goat.col + dc };
      if (to.row >= 1 && to.row <= 5 && to.col >= 1 && to.col <= 5 &&
          isAdjacent(goat, to) && !isOccupied(board, to)) {
        moves.push(to);
      }
    }
  }
  return moves;
}

// --- Tiger moves ---
export function getTigerMoves(board, tiger) {
  const moves = [];
  // Normal moves
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const to = { row: tiger.row + dr, col: tiger.col + dc };
      if (to.row >= 1 && to.row <= 5 && to.col >= 1 && to.col <= 5 &&
          isAdjacent(tiger, to) && !isOccupied(board, to)) {
        moves.push(to);
      }
    }
  }
  // Jump moves
  for (let dr = -2; dr <= 2; dr += 2) {
    for (let dc = -2; dc <= 2; dc += 2) {
      if (dr === 0 && dc === 0) continue;
      const to = { row: tiger.row + dr, col: tiger.col + dc };
      const mid = { row: tiger.row + dr / 2, col: tiger.col + dc / 2 };
      const jumpedGoat = board.goats.find(g => g.row === mid.row && g.col === mid.col);
      if (jumpedGoat && isAdjacent(tiger, mid) && isAdjacent(mid, to) && !isOccupied(board, to)) {
        moves.push(to);
      }
    }
  }
  return moves;
}

// --- Apply a move ---
export function applyMove(board, move, player) {
  const newBoard = JSON.parse(JSON.stringify(board));
  if (player === "goat") {
    if (move.from) { // movement
      newBoard.goats = newBoard.goats.map(g => (g.row === move.from.row && g.col === move.from.col ? move.to : g));
    } else { // placement
      newBoard.goats.push(move.to);
      newBoard.goatsPlaced = (newBoard.goatsPlaced || 0) + 1;
    }
  } else { // tiger
    const tigerIndex = newBoard.tigers.findIndex(t => t.row === move.from.row && t.col === move.from.col);
    if (tigerIndex !== -1) newBoard.tigers[tigerIndex] = move.to;
    // Check if jump
    const midRow = (move.from.row + move.to.row) / 2;
    const midCol = (move.from.col + move.to.col) / 2;
    const jumpedGoatIndex = newBoard.goats.findIndex(g => g.row === midRow && g.col === midCol);
    if (jumpedGoatIndex !== -1) {
      newBoard.goats.splice(jumpedGoatIndex, 1);
      newBoard.goatsKilled++;
    }
  }
  return newBoard;
}

// --- Simple Minimax for bot ---
export function findBestMove(board, player) {
  const moves = [];
  if (player === "tiger") {
    board.tigers.forEach(t => {
      getTigerMoves(board, t).forEach(to => moves.push({ from: t, to }));
    });
  } else {
    if (board.goatsPlaced < 20) {
      // Place in empty spot
      for (let r = 1; r <= 5; r++) {
        for (let c = 1; c <= 5; c++) {
          if (!isOccupied(board, { row: r, col: c })) moves.push({ to: { row: r, col: c } });
        }
      }
    } else {
      board.goats.forEach(g => {
        getGoatMoves(board, g).forEach(to => moves.push({ from: g, to }));
      });
    }
  }

  if (moves.length === 0) return null;

  // Random selection for simplicity
  return moves[Math.floor(Math.random() * moves.length)];
}
