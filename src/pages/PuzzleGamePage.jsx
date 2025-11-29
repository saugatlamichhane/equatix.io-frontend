import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Trophy, Clock, Target, RotateCcw, Info } from "lucide-react";
import { getCellMultiplier } from "../utils/multiplierCells";
import api from "../utils/api";

const BOARD_SIZE = 15;
const RACK_SIZE = 10;

const PuzzleGamePage = () => {
  const { puzzleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [puzzle, setPuzzle] = useState(null);
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [initialBoard, setInitialBoard] = useState(null);
  const [initialRack, setInitialRack] = useState(null);
  const [placedTiles, setPlacedTiles] = useState([]); // Track tiles placed in current move
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadPuzzle();
    const timer = setInterval(() => {
      if (!isCompleted) {
        setTimeTaken((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [puzzleId]);

  const loadPuzzle = async () => {
    try {
      setLoading(true);
      
      // Fetch puzzle from backend using the new endpoint
      try {
        const res = await api.get(`/puzzle/${puzzleId}`);
        const puzzleData = res.data;
        
        // Backend returns: {puzzle_id, difficulty, objective, board: [{row, col, value}], rack: ["1","2","+"]}
        setPuzzle({
          id: puzzleData.puzzle_id,
          puzzle_id: puzzleData.puzzle_id,
          difficulty: puzzleData.difficulty,
          objective: puzzleData.objective,
          name: `Puzzle ${puzzleData.puzzle_id}`
        });
        
        // Initialize board with pre-placed tiles from backend
        const newBoard = Array(BOARD_SIZE)
          .fill(null)
          .map(() => Array(BOARD_SIZE).fill(null));
        
        if (puzzleData.board && Array.isArray(puzzleData.board)) {
          puzzleData.board.forEach(({ row, col, value }) => {
            if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
              newBoard[row][col] = value;
            }
          });
        }
        
        setBoard(newBoard);
        setInitialBoard(newBoard.map(row => [...row]));

        // Initialize rack from backend
        const newRack = Array(RACK_SIZE).fill(null);
        if (puzzleData.rack && Array.isArray(puzzleData.rack)) {
          puzzleData.rack.forEach((value, index) => {
            if (index < RACK_SIZE) {
              newRack[index] = value;
            }
          });
        }
        setRack(newRack);
        setInitialRack([...newRack]);
        setPlacedTiles([]); // Reset placed tiles
        
      } catch (err) {
        console.error("Failed to load puzzle from backend:", err);
        // Fallback to localStorage
        const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
        const foundPuzzle = savedPuzzles.find((p) => p.id === puzzleId);

        if (foundPuzzle) {
          setPuzzle(foundPuzzle);
          
          const newBoard = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));
          
          if (foundPuzzle.initialBoard) {
            foundPuzzle.initialBoard.forEach(({ row, col, value }) => {
              newBoard[row][col] = value;
            });
          }
          
          setBoard(newBoard);
          setInitialBoard(newBoard.map(row => [...row]));

          const newRack = Array(RACK_SIZE).fill(null);
          if (foundPuzzle.initialRack) {
            foundPuzzle.initialRack.forEach(({ index, value }) => {
              newRack[index] = value;
            });
          }
          setRack(newRack);
          setInitialRack([...newRack]);
        } else {
          alert("Puzzle not found!");
          navigate("/puzzles");
        }
      }
    } catch (error) {
      console.error("Failed to load puzzle:", error);
      alert("Failed to load puzzle");
      navigate("/puzzles");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, tile, rackIndex) => {
    if (isCompleted) return;
    e.dataTransfer.setData("tile", tile);
    e.dataTransfer.setData("rackIndex", rackIndex);
  };

  const handleDrop = (e, row, col) => {
    if (isCompleted || validating) return;
    e.preventDefault();
    const tile = e.dataTransfer.getData("tile");
    const rackIndex = parseInt(e.dataTransfer.getData("rackIndex"));
    
    if (!tile || rackIndex === null) return;

    // Check if cell is already occupied (including initial board tiles)
    if (board[row][col] !== null) return;

    // Update board
    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = tile;
      return newBoard;
    });

    // Remove tile from rack
    setRack((prev) => {
      const newRack = [...prev];
      newRack[rackIndex] = null;
      return newRack;
    });

    // Track placed tile for validation
    setPlacedTiles((prev) => [...prev, { row, col, value: tile }]);
  };

  const allowDrop = (e) => e.preventDefault();

  const handleUndo = () => {
    if (placedTiles.length === 0) return;
    
    // Get the last placed tile
    const lastTile = placedTiles[placedTiles.length - 1];
    
    // Remove it from board
    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[lastTile.row][lastTile.col] = null;
      return newBoard;
    });
    
    // Find the tile in rack and restore it
    // Find first empty slot in rack
    setRack((prev) => {
      const newRack = [...prev];
      const emptyIndex = newRack.findIndex(tile => tile === null);
      if (emptyIndex !== -1) {
        newRack[emptyIndex] = lastTile.value;
      }
      return newRack;
    });
    
    // Remove from placed tiles
    setPlacedTiles((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (!initialBoard || !initialRack) return;
    setBoard(initialBoard.map(row => [...row]));
    setRack([...initialRack]);
    setPlacedTiles([]);
    setScore(0);
    setMoves(0);
    setTimeTaken(0);
    setIsCompleted(false);
  };

  const handleSubmit = async () => {
    if (isCompleted || validating || !puzzle) return;
    
    // Check if there are any placed tiles to validate
    if (placedTiles.length === 0) {
      alert("Please place at least one tile before submitting!");
      return;
    }

    setValidating(true);
    
    try {
      // Call the validateMove endpoint
      const response = await api.post("/puzzle/validateMove", {
        puzzle_id: parseInt(puzzle.puzzle_id || puzzle.id),
        placed_tiles: placedTiles.map(tile => ({
          row: tile.row,
          col: tile.col,
          value: tile.value
        }))
      });

      // If validation succeeds (200 OK), the move is valid
      if (response.status === 200) {
        // Move is valid - puzzle is solved!
        setIsCompleted(true);
        setMoves((prev) => prev + 1);
        
        // Clear placed tiles for next move (if needed)
        setPlacedTiles([]);
        
        alert("🎉 Puzzle solved! Great job!");
      }
    } catch (error) {
      // Validation failed - show error message
      const errorMessage = error.response?.data || error.message || "Invalid move. Please try again.";
      alert(`❌ ${errorMessage}`);
      
      // Optionally, you could reset the invalid tiles here
      // For now, we'll let the user fix it manually
    } finally {
      setValidating(false);
    }
  };

  // Note: Completion is automatically saved by the backend when validateMove succeeds
  // The backend updates puzzle_progress table when a valid move is submitted

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading puzzle...</div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-red-400">Puzzle not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/puzzles")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Puzzles
          </button>
          <h1 className="text-2xl font-bold text-white">{puzzle.name || "Puzzle"}</h1>
          <div className="flex items-center gap-4 text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span className="font-mono">{formatTime(timeTaken)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>{moves} moves</span>
            </div>
          </div>
        </div>

        {/* Puzzle Info */}
        <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 mb-6">
          <p className="text-slate-300 mb-2">{puzzle.objective || "Solve the puzzle!"}</p>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-slate-300">Objective: {puzzle.objective || "Complete the puzzle"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Difficulty: </span>
              <span className={`font-semibold ${
                puzzle.difficulty === "easy" ? "text-green-400" :
                puzzle.difficulty === "hard" ? "text-red-400" : "text-yellow-400"
              }`}>
                {puzzle.difficulty || "medium"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-300">Current Score: </span>
              <span className="font-bold text-indigo-400">{score}</span>
            </div>
          </div>
        </div>

        {isCompleted && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6 text-center">
            <p className="text-green-400 font-bold text-lg">🎉 Puzzle Completed!</p>
            <p className="text-slate-300 text-sm mt-1">
              Score: {score} | Moves: {moves} | Time: {formatTime(timeTaken)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Board */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Game Board</h2>
                <div className="flex items-center gap-4">
                  <div className="text-slate-300">
                    {isCompleted ? "Puzzle Completed" : "Your Turn"}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isCompleted ? "bg-gray-400" : "bg-green-400 animate-pulse"
                    }`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg">
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const multiplier = getCellMultiplier(rowIdx, colIdx);
                    const hasTile = cell !== null;
                    const isInitial = initialBoard?.[rowIdx]?.[colIdx] !== null;
                    const isCenter = rowIdx === Math.floor(BOARD_SIZE / 2) &&
                      colIdx === Math.floor(BOARD_SIZE / 2);
                    
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        onDrop={(e) => handleDrop(e, rowIdx, colIdx)}
                        onDragOver={allowDrop}
                        className={`w-10 h-10 flex flex-col items-center justify-center border-2 text-lg font-bold rounded transition-all relative ${
                          hasTile
                            ? isInitial
                              ? "bg-purple-600 text-white border-purple-400"
                              : "bg-slate-600 text-white border-slate-400"
                            : isCenter
                            ? "bg-gray-700 hover:bg-gray-600 border-gray-500"
                            : multiplier.type !== 'none'
                            ? `${multiplier.bg} hover:opacity-70 border-slate-400 ${multiplier.border} border-2`
                            : "bg-slate-600 hover:bg-slate-500 border-slate-500"
                        }`}
                      >
                        {cell || (multiplier.label && !hasTile) ? (
                          <span className="text-xs text-white font-bold">{cell || multiplier.label}</span>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Info */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Player</h3>
              <div className="p-3 rounded-lg bg-indigo-500/20 ring-1 ring-indigo-400">
                <div className="flex items-center gap-3">
                  <img
                    src={user?.photoURL || "https://via.placeholder.com/40"}
                    alt="You"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="text-white font-semibold">{user?.displayName || "You"}</div>
                    <div className="text-slate-400 text-sm">Puzzle Mode</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">{score}</div>
                    <div className="text-slate-400 text-sm">points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rack */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Your Tiles</h3>
                {placedTiles.length > 0 && (
                  <span className="text-yellow-400 text-sm font-semibold">
                    {placedTiles.length} placed
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={!!tile && !isCompleted}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile
                        ? isCompleted
                          ? "bg-slate-500 text-white border-slate-400 cursor-not-allowed"
                          : "cursor-move bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
                        : "bg-slate-600 border-slate-500"
                    }`}
                  >
                    {tile}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isCompleted || validating || placedTiles.length === 0}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCompleted || validating || placedTiles.length === 0
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  }`}
                >
                  {validating ? "Validating..." : "Validate Move"}
                </button>
                
                {placedTiles.length > 0 && (
                  <button
                    onClick={handleUndo}
                    disabled={isCompleted || validating}
                    className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Undo Last Tile
                  </button>
                )}
                
                {placedTiles.length > 0 && (
                  <p className="text-xs text-slate-400 text-center">
                    {placedTiles.length} tile{placedTiles.length !== 1 ? 's' : ''} placed
                  </p>
                )}
                
                <button
                  onClick={handleReset}
                  disabled={isCompleted}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    isCompleted
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                >
                  Reset Puzzle
                </button>
              </div>
            </div>

            {/* Multiplier Legend */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Board Multipliers
              </h3>
              
              <div className="space-y-3">
                {/* Triple Equation */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600/50 border-2 border-red-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">3x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Triple Equation (3x)</div>
                    <div className="text-slate-400 text-xs">Entire equation ×3</div>
                  </div>
                </div>

                {/* Double Equation */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600/50 border-2 border-purple-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Double Equation (2x)</div>
                    <div className="text-slate-400 text-xs">Entire equation ×2</div>
                  </div>
                </div>

                {/* Triple Tile */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/50 border-2 border-blue-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">3x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Triple Tile (3x)</div>
                    <div className="text-slate-400 text-xs">Single tile ×3</div>
                  </div>
                </div>

                {/* Double Tile */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600/50 border-2 border-green-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Double Tile (2x)</div>
                    <div className="text-slate-400 text-xs">Single tile ×2</div>
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 p-3 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                  <p className="text-indigo-300 text-xs">
                    💡 <strong>Tip:</strong> Place tiles on colored cells for bonus points!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleGamePage;

