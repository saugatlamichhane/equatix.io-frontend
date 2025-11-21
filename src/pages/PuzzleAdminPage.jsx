import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, X, Grid, Layers } from "lucide-react";
import { getCellMultiplier } from "../utils/multiplierCells";

const BOARD_SIZE = 15;
const RACK_SIZE = 10;

const PuzzleAdminPage = () => {
  const navigate = useNavigate();

  const [puzzleName, setPuzzleName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [targetScore, setTargetScore] = useState(100);

  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));

  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedMode, setSelectedMode] = useState("board"); // 'board' or 'rack'
  const [selectedRackIndex, setSelectedRackIndex] = useState(null);

  // Available tiles (numbers, operators, variables)
  const availableTiles = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
    "+", "-", "*", "/", "=", "x", "y", "z"
  ];

  const handleTileSelect = (tile) => {
    setSelectedTile(tile);
  };

  const handleBoardClick = (row, col) => {
    if (selectedMode !== "board" || !selectedTile) return;

    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      // Toggle: if same tile, remove it; otherwise place/update
      if (newBoard[row][col] === selectedTile) {
        newBoard[row][col] = null;
      } else {
        newBoard[row][col] = selectedTile;
      }
      return newBoard;
    });
  };

  const handleRackClick = (index) => {
    if (selectedMode !== "rack" || !selectedTile) return;

    setRack((prev) => {
      const newRack = [...prev];
      // Toggle: if same tile, remove it; otherwise place/update
      if (newRack[index] === selectedTile) {
        newRack[index] = null;
      } else {
        newRack[index] = selectedTile;
      }
      return newRack;
    });
  };

  const handleRemoveFromBoard = (row, col) => {
    setBoard((prev) => {
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = null;
      return newBoard;
    });
  };

  const handleRemoveFromRack = (index) => {
    setRack((prev) => {
      const newRack = [...prev];
      newRack[index] = null;
      return newRack;
    });
  };

  const handleSave = () => {
    if (!puzzleName.trim()) {
      alert("Please enter a puzzle name");
      return;
    }

    // Collect initial board tiles
    const initialBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) {
          initialBoard.push({ row, col, value: board[row][col] });
        }
      }
    }

    // Collect initial rack tiles
    const initialRack = [];
    rack.forEach((tile, index) => {
      if (tile !== null) {
        initialRack.push({ index, value: tile });
      }
    });

    const newPuzzle = {
      id: `puzzle-${Date.now()}`,
      name: puzzleName,
      description,
      difficulty,
      target_score: parseInt(targetScore) || 100,
      initialBoard,
      initialRack,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage
    const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
    savedPuzzles.push(newPuzzle);
    localStorage.setItem("puzzles", JSON.stringify(savedPuzzles));

    alert("Puzzle saved successfully!");
    navigate("/puzzles");
  };

  const clearBoard = () => {
    if (confirm("Clear all tiles from the board?")) {
      setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    }
  };

  const clearRack = () => {
    if (confirm("Clear all tiles from the rack?")) {
      setRack(Array(RACK_SIZE).fill(null));
    }
  };

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
          <h1 className="text-2xl font-bold text-white">Create Puzzle</h1>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Save className="w-5 h-5" />
            Save Puzzle
          </button>
        </div>

        {/* Puzzle Info Form */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Puzzle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Puzzle Name *
              </label>
              <input
                type="text"
                value={puzzleName}
                onChange={(e) => setPuzzleName(e.target.value)}
                placeholder="e.g., Puzzle 1, Daily Challenge"
                className="w-full bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the puzzle..."
                rows={3}
                className="w-full bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Target Score
              </label>
              <input
                type="number"
                value={targetScore}
                onChange={(e) => setTargetScore(e.target.value)}
                min="1"
                className="w-full bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tile Selector */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Select Tile</h2>
          <div className="flex flex-wrap gap-2">
            {availableTiles.map((tile) => (
              <button
                key={tile}
                onClick={() => handleTileSelect(tile)}
                className={`w-12 h-12 flex items-center justify-center border rounded text-lg font-bold transition-all ${
                  selectedTile === tile
                    ? "bg-indigo-500 text-white border-indigo-400 ring-2 ring-indigo-300"
                    : "bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                }`}
              >
                {tile}
              </button>
            ))}
          </div>
          {selectedTile && (
            <div className="mt-4 text-slate-300">
              Selected: <span className="font-bold text-indigo-400">{selectedTile}</span>
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Placement Mode</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setSelectedMode("board")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedMode === "board"
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Grid className="w-5 h-5" />
              Place on Board
            </button>
            <button
              onClick={() => setSelectedMode("rack")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                selectedMode === "rack"
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              <Layers className="w-5 h-5" />
              Place in Rack
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-2">
            {selectedMode === "board"
              ? "Click on board cells to place/remove tiles"
              : "Click on rack slots to place/remove tiles"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Board */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Game Board</h3>
                <button
                  onClick={clearBoard}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear Board
                </button>
              </div>
              <div className="grid grid-cols-15 gap-1 bg-slate-900 p-2 rounded-lg">
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const multiplier = getCellMultiplier(rowIdx, colIdx);
                    return (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        onClick={() => handleBoardClick(rowIdx, colIdx)}
                        className={`w-8 h-8 flex items-center justify-center border rounded text-sm font-bold transition-all cursor-pointer relative ${
                          cell
                            ? "bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
                            : multiplier.type !== "none"
                            ? `${multiplier.bg} ${multiplier.border} border-2 hover:opacity-80`
                            : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                        }`}
                      >
                        {cell || (multiplier.type !== "none" && multiplier.label)}
                        {cell && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromBoard(rowIdx, colIdx);
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Rack */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Rack</h3>
                <button
                  onClick={clearRack}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleRackClick(idx)}
                    className={`relative w-12 h-12 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all cursor-pointer ${
                      tile
                        ? "bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
                        : "bg-slate-600 border-slate-500 hover:bg-slate-500"
                    }`}
                  >
                    {tile || idx + 1}
                    {tile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromRack(idx);
                        }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">Instructions</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>1. Enter puzzle details</li>
                <li>2. Select a tile</li>
                <li>3. Choose placement mode</li>
                <li>4. Click to place tiles</li>
                <li>5. Click X to remove</li>
                <li>6. Save when done</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuzzleAdminPage;

