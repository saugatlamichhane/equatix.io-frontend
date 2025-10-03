import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 15;
const RACK_SIZE = 8;

const BotGamePage = () => {
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [turn, setTurn] = useState(1);

  const wsRef = useRef(null);

  const handleDragStart = (e, tile, rackIndex) => {
    e.dataTransfer.setData("tile", tile);
    e.dataTransfer.setData("rackIndex", rackIndex);
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData("tile");
    const rackIndex = e.dataTransfer.getData("rackIndex");
    if (!tile) return;

    // Optimistically update board visually
    setBoard((prev) => {
      if (prev[row][col] !== null) return prev;
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = tile;
      return newBoard;
    });

    setRack((prev) => {
      const newRack = [...prev];
      newRack[rackIndex] = null;
      return newRack;
    });

    // Send placement to backend (convert to 1-based)
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: "placement",
        payload: { row: row + 1, col: col + 1, value: tile },
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const sendCommand = (type, extra = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...extra }));
    }
  };

  const handleSubmitMove = () => sendCommand("evaluate");
  const handlePass = () => sendCommand("pass");
  const handleReset = () => sendCommand("reset");
  const handleSwap = () => {
    if (selectedTiles.length > 0) {
      sendCommand("swap", { tiles: selectedTiles });
      setSelectedTiles([]);
    }
  };

  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:5555/echo?room_name=room34&isBot=0");

    wsRef.current.onopen = () => console.log("WebSocket connected");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);

        // Initial rack and turn
        if (data.type === "init" && Array.isArray(data.rack)) {
          setRack(data.rack);
          setTurn(data.turn);
        }

        // Update rack
        if (data.type === "rack" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }

        // Update game state
        if (data.type === "state") {
          setScores({ player: data["Player1 Score"], bot: data["Player2 Score"] });
          setTurn(data.turn);

          const newBoard = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));

          // Place confirmed tiles
          if (Array.isArray(data.tiles)) {
            data.tiles.forEach(({ row, col, value }) => {
              const r = row - 1;
              const c = col - 1;
              if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && typeof value === "string") {
                newBoard[r][c] = value;
              }
            });
          }

          // Place current (unconfirmed) tiles
          if (Array.isArray(data["current tiles"])) {
            data["current tiles"].forEach(({ row, col, value }) => {
              const r = row - 1;
              const c = col - 1;
              if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && typeof value === "string") {
                newBoard[r][c] = value;
              }
            });
          }

          setBoard(newBoard);
        }

        if (data.type === "game_over") {
          alert(
            data.winner === 0
              ? "Game Over! It's a tie."
              : `Game Over! Winner: Player ${data.winner}`
          );
        }

        if (data.type === "error") {
          alert("Error: " + data.message);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket disconnected");

    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Play vs Bot</h1>
          <p className="text-slate-300">Challenge the AI in Equatix Math Scrabble</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Game Board</h2>
              <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg">
                {board.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                      onDragOver={allowDrop}
                      className="w-10 h-10 flex items-center justify-center bg-slate-600 border border-slate-500 text-lg font-bold text-white rounded hover:bg-slate-500"
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Game Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Game Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Turn</span>
                  <span className="text-white font-semibold">{turn === 1 ? "You" : "Bot"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Your Score</span>
                  <span className="text-white font-semibold">{scores.player}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Bot Score</span>
                  <span className="text-white font-semibold">{scores.bot}</span>
                </div>
              </div>
            </div>

            {/* Rack */}
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Your Tiles</h3>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={!!tile}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    onClick={() => {
                      if (tile) {
                        setSelectedTiles((prev) =>
                          prev.includes(tile)
                            ? prev.filter((t) => t !== tile)
                            : [...prev, tile]
                        );
                      }
                    }}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile
                        ? selectedTiles.includes(tile)
                          ? "bg-yellow-500 text-black border-yellow-400"
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
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleSubmitMove}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg"
                >
                  Submit Move
                </button>
                <button
                  onClick={handleSwap}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-lg"
                >
                  Swap Tiles
                </button>
                <button
                  onClick={handlePass}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg"
                >
                  Pass Turn
                </button>
                <button
                  onClick={handleReset}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                >
                  Reset Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotGamePage;
