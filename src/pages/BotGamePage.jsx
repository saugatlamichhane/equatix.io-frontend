import React, { useState, useEffect, useRef } from "react";
import { Trophy, Zap, Clock } from "lucide-react";

const BOARD_SIZE = 15;
const RACK_SIZE = 10;

const BotGamePage = () => {
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedTileIndices, setSelectedTileIndices] = useState([]);
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [turn, setTurn] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState("normal"); // 'normal', 'blitz', 'marathon'
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // Timer in seconds

  const wsRef = useRef(null);
  const timerRef = useRef(null);

  // Get initial time based on variant
  const getInitialTime = (variant) => {
    switch (variant) {
      case "blitz":
        return 180; // 3 minutes
      case "marathon":
        return 600; // 10 minutes
      default:
        return 300; // 5 minutes (normal)
    }
  };

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
  const handleReset = () => {
    sendCommand("reset");
    // Reset timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimeLeft(getInitialTime(selectedVariant));
  };
  const handleSwap = () => {
    if (selectedTileIndices.length > 0) {
      // Get actual tile values from the rack using indices
      const tilesToSwap = selectedTileIndices.map(idx => rack[idx]).filter(tile => tile !== null);
      if (tilesToSwap.length > 0) {
        sendCommand("swap", { tiles: tilesToSwap });
        setSelectedTileIndices([]);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(getInitialTime(selectedVariant));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Only connect when game starts
  useEffect(() => {
    if (!gameStarted) return;
    
    const roomName = `botgame_${selectedVariant}_${Date.now()}`;
    wsRef.current = new WebSocket(`ws://localhost:5555/echo?room_name=${roomName}&isBot=0&variant=${selectedVariant}`);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      console.log("Game variant:", selectedVariant);
    };

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
  }, [gameStarted, selectedVariant]);

  // Timer effect - starts when game starts
  useEffect(() => {
    if (!gameStarted) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Start timer
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          
          // If time runs out, end the game
          if (newTime === 0) {
            const playerScore = scores.player;
            const botScore = scores.bot;
            
            let winner = 'draw';
            if (playerScore > botScore) winner = 'player';
            else if (botScore > playerScore) winner = 'bot';
            
            alert(
              winner === 'draw'
                ? "Time's up! It's a tie."
                : winner === 'player'
                ? `Time's up! You win ${playerScore}-${botScore}!`
                : `Time's up! Bot wins ${botScore}-${playerScore}!`
            );
            
            // Stop the timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameStarted, scores]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Play vs Bot</h1>
            <p className="text-slate-300">Challenge the AI in Equatix Math Scrabble</p>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-8 ring-1 ring-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Select Game Variant</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setSelectedVariant("normal")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedVariant === "normal"
                    ? "bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-300"
                    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <Trophy className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Normal</h3>
                <p className="text-slate-400 text-sm mb-1">Standard gameplay</p>
                <p className="text-slate-500 text-xs">~15 min</p>
              </button>
              <button
                onClick={() => setSelectedVariant("blitz")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedVariant === "blitz"
                    ? "bg-yellow-500/20 border-yellow-400 ring-2 ring-yellow-300"
                    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <Zap className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Blitz</h3>
                <p className="text-slate-400 text-sm mb-1">Fast-paced action</p>
                <p className="text-slate-500 text-xs">~5 min</p>
              </button>
              <button
                onClick={() => setSelectedVariant("marathon")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedVariant === "marathon"
                    ? "bg-green-500/20 border-green-400 ring-2 ring-green-300"
                    : "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
                }`}
              >
                <Clock className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold text-lg mb-2">Marathon</h3>
                <p className="text-slate-400 text-sm mb-1">Extended gameplay</p>
                <p className="text-slate-500 text-xs">~30 min</p>
              </button>
            </div>
            <button
              onClick={startGame}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Start Game ({selectedVariant.charAt(0).toUpperCase() + selectedVariant.slice(1)})
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-white mb-2">Play vs Bot</h1>
            <p className="text-slate-300">
              Variant: <span className="font-semibold text-indigo-400 capitalize">{selectedVariant}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-5 h-5" />
            <span className={`font-mono text-lg ${timeLeft < 60 ? "text-red-400 font-bold" : timeLeft < 120 ? "text-yellow-400" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
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
                      className={`w-10 h-10 flex items-center justify-center border border-slate-500 text-lg font-bold text-white rounded 
                      ${rIdx === Math.floor(BOARD_SIZE/2)&&cIdx === Math.floor(BOARD_SIZE/2)?"bg-gray-700" : "bg-slate-600 hover:bg-slate-500"}`}
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
                        setSelectedTileIndices((prev) =>
                          prev.includes(idx)
                            ? prev.filter((i) => i !== idx)
                            : [...prev, idx]
                        );
                      }
                    }}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile
                        ? selectedTileIndices.includes(idx)
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
