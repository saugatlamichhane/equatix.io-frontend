import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 15;
const RACK_SIZE = 8;

// Example bag (numbers + operators)
const INITIAL_BAG = [
  ..."0123456789".split(""),
  ..."+-*/".split(""),
];

const BotGamePage = () => {
  const [bag, setBag] = useState(INITIAL_BAG);
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );

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

    // Update board
    setBoard((prev) => {
      if (prev[row][col] !== null) return prev;
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = tile;
      return newBoard;
    });

    // Update rack
    setRack((prev) => {
      const newRack = [...prev];
      newRack[rackIndex] = null;
      return newRack;
    });

    // Send placement message to backend
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "placement",
        payload: {
          row: row,
          col: col,
          value: tile,
        },
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("Sent to server:", message);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  // WebSocket connection
  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:5555/echo?room_name=room3&isBot=0");

    wsRef.current.onopen = () => console.log("WebSocket connected");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);

        // If it's an init message, update rack
        if (data.type === "init" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket disconnected");
    wsRef.current.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Play vs Bot</h1>
          <p className="text-slate-300">Challenge the AI in a game of Equatix Math Scrabble</p>
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
                      className="w-10 h-10 flex items-center justify-center bg-slate-600 border border-slate-500 text-lg font-bold text-white rounded hover:bg-slate-500 transition-colors"
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Game Info & Controls */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Game Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-300">Your Turn</span>
                  <span className="text-green-400">✓</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Score</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Bot Score</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Your Tiles</h3>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={!!tile}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile 
                        ? "cursor-move bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600" 
                        : "bg-slate-600 border-slate-500"
                    }`}
                  >
                    {tile}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Submit Move
                </button>
                <button className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Pass Turn
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Forfeit
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
