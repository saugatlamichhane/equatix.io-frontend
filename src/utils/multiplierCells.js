// Multiplier cell definitions matching the backend
// Coordinates are 1-based (as per backend)

// Triple Equation (3x Equation Score) - 8 cells
const TRIPLE_EQUATION = [
  { row: 1, col: 1 }, { row: 1, col: 8 }, { row: 1, col: 15 },
  { row: 8, col: 1 }, { row: 8, col: 15 },
  { row: 15, col: 1 }, { row: 15, col: 8 }, { row: 15, col: 15 }
];

// Double Equation (2x Equation Score) - 17 cells
const DOUBLE_EQUATION = [
  { row: 2, col: 2 }, { row: 2, col: 14 },
  { row: 3, col: 3 }, { row: 3, col: 13 },
  { row: 4, col: 4 }, { row: 4, col: 12 },
  { row: 5, col: 5 }, { row: 5, col: 11 },
  { row: 8, col: 8 },
  { row: 11, col: 5 }, { row: 11, col: 11 },
  { row: 12, col: 4 }, { row: 12, col: 12 },
  { row: 13, col: 3 }, { row: 13, col: 13 },
  { row: 14, col: 2 }, { row: 14, col: 14 }
];

// Triple Tile (3x Tile Score) - 12 cells
const TRIPLE_TILE = [
  { row: 2, col: 6 }, { row: 2, col: 10 },
  { row: 6, col: 2 }, { row: 6, col: 6 }, { row: 6, col: 10 }, { row: 6, col: 14 },
  { row: 10, col: 2 }, { row: 10, col: 6 }, { row: 10, col: 10 }, { row: 10, col: 14 },
  { row: 14, col: 6 }, { row: 14, col: 10 }
];

// Double Tile (2x Tile Score) - 24 cells
const DOUBLE_TILE = [
  { row: 1, col: 4 }, { row: 1, col: 12 },
  { row: 3, col: 7 }, { row: 3, col: 9 },
  { row: 4, col: 1 }, { row: 4, col: 8 }, { row: 4, col: 15 },
  { row: 7, col: 3 }, { row: 7, col: 7 }, { row: 7, col: 9 }, { row: 7, col: 13 },
  { row: 8, col: 4 }, { row: 8, col: 12 },
  { row: 9, col: 3 }, { row: 9, col: 7 }, { row: 9, col: 9 }, { row: 9, col: 13 },
  { row: 12, col: 1 }, { row: 12, col: 8 }, { row: 12, col: 15 },
  { row: 13, col: 7 }, { row: 13, col: 9 },
  { row: 15, col: 4 }, { row: 15, col: 12 }
];

// Convert to 0-based coordinates for frontend array indexing
const convertToZeroBased = (cells) => 
  cells.map(({ row, col }) => ({ row: row - 1, col: col - 1 }));

export const TRIPLE_EQ_CELLS = convertToZeroBased(TRIPLE_EQUATION);
export const DOUBLE_EQ_CELLS = convertToZeroBased(DOUBLE_EQUATION);
export const TRIPLE_TILE_CELLS = convertToZeroBased(TRIPLE_TILE);
export const DOUBLE_TILE_CELLS = convertToZeroBased(DOUBLE_TILE);

// Get the multiplier type for a cell
export const getCellMultiplier = (row, col) => {
  const isTripleEq = TRIPLE_EQ_CELLS.some(c => c.row === row && c.col === col);
  const isDoubleEq = DOUBLE_EQ_CELLS.some(c => c.row === row && c.col === col);
  const isTripleTile = TRIPLE_TILE_CELLS.some(c => c.row === row && c.col === col);
  const isDoubleTile = DOUBLE_TILE_CELLS.some(c => c.row === row && c.col === col);
  
  if (isTripleEq) return { type: 'triple_eq', label: '3x', bg: 'bg-red-600/50', border: 'border-red-400' };
  if (isDoubleEq) return { type: 'double_eq', label: '2x', bg: 'bg-purple-600/50', border: 'border-purple-400' };
  if (isTripleTile) return { type: 'triple_tile', label: '3x', bg: 'bg-blue-600/50', border: 'border-blue-400' };
  if (isDoubleTile) return { type: 'double_tile', label: '2x', bg: 'bg-green-600/50', border: 'border-green-400' };
  
  return { type: 'none', label: '', bg: '', border: '' };
};

// Check if a cell is a multiplier cell
export const isMultiplierCell = (row, col) => {
  return getCellMultiplier(row, col).type !== 'none';
};
