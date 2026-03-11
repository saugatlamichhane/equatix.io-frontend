import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Clock, Info, Trophy } from "lucide-react";
import GameOverModal from "../components/GameOverModal";
import { getCellMultiplier } from "../utils/multiplierCells";

const BOARD_SIZE = 15;
const RACK_SIZE = 10;

const BotGamePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedTile, setSelectedTile] = useState(null);
  const [selectedTileIndex, setSelectedTileIndex] = useState(null);
  const [scores, setScores] = useState({ player: 0, bot: 0 });
  const [turn, setTurn] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes standard

  const [gameOver, setGameOver] = useState({
    isOpen: false,
    winner: null,
    finalScores: { player: 0, bot: 0 }
  });
  const [connectionError, setConnectionError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [selectedTileIndices, setSelectedTileIndices] = useState([]);

  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const handleTileClick = (tile, index) => {
    if (turn !== 1 || !tile) return;
    if (selectedTileIndex === index) {
      setSelectedTile(null);
      setSelectedTileIndex(null);
    } else {
      setSelectedTile(tile);
      setSelectedTileIndex(index);
    }
  };

  const handleBoardClick = (row, col) => {
    if (turn !== 1 || !selectedTile) return;
    
    setBoard((prev) => {
      if (prev[row][col] !== null) return prev;
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = selectedTile;
      
      // Remove from rack
      setRack((prevRack) => {
        const newRack = [...prevRack];
        newRack[selectedTileIndex] = null;
        return newRack;
      });
      
      setSelectedTile(null);
      setSelectedTileIndex(null);
      return newBoard;
    });
  };

  const handleDragStart = (e, tile, rackIndex) => {
    if (turn !== 1) return; 
    e.dataTransfer.setData("tile", tile);
    e.dataTransfer.setData("rackIndex", rackIndex);
  };

  const handleDrop = (e, row, col) => {
    if (turn !== 1) return;
    e.preventDefault();
    const tile = e.dataTransfer.getData("tile");
    const rackIndex = e.dataTransfer.getData("rackIndex");
    if (!tile) return;

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
      try {
        const message = { type, ...extra };
        console.log("Sending command:", message);
        wsRef.current.send(JSON.stringify(message));
      } catch (err) {
        console.error("Error sending message:", err);
        setConnectionError("Failed to send command to server.");
      }
    } else {
      console.warn("Cannot send command - WebSocket not connected. State:", wsRef.current?.readyState);
      setConnectionError("Not connected to game server. Waiting for connection...");
    }
  };

  const handleSubmitMove = () => {
    if (turn !== 1) return;
    sendCommand("evaluate");
  };
  const handlePass = () => {
    if (turn !== 1) return;
    sendCommand("pass");
  };
  const handleReset = () => {
    if (turn !== 1) return;
    sendCommand("reset");
  };
  const handleSwap = () => {
    if (turn !== 1) return;
    if (selectedTileIndices.length > 0) {
      const tilesToSwap = selectedTileIndices.map(idx => rack[idx]).filter(tile => tile !== null);
      if (tilesToSwap.length > 0) {
        sendCommand("swap", { tiles: tilesToSwap });
        setSelectedTileIndices([]);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!gameStarted) return;
    
    const roomName = `botgame_normal_${Date.now()}`;
    const wsUrl = `wss://equatix-backend.onrender.com/echo?room_name=${roomName}&uid=${user.uid}&isBot=1`;
    console.log("Attempting WebSocket connection to:", wsUrl);
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected");
      setConnectionStatus("connected");
      setConnectionError(null);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      const errorMsg = "Failed to connect to game server. Please check your internet connection.";
      setConnectionError(errorMsg);
      setConnectionStatus("error");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init" && Array.isArray(data.rack)) {
          setRack(data.rack);
          setTurn(data.turn);
        }
        if (data.type === "rack" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }
        if (data.type === "state") {
          setScores({ player: data["Player1 Score"], bot: data["Player2 Score"] });
          setTurn(data.turn);
          const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
          if (Array.isArray(data.tiles)) {
            data.tiles.forEach(({ row, col, value }) => {
              newBoard[row - 1][col - 1] = value;
            });
          }
          if (Array.isArray(data["current tiles"])) {
            data["current tiles"].forEach(({ row, col, value }) => {
              newBoard[row - 1][col - 1] = value;
            });
          }
          setBoard(newBoard);
        }
        if (data.type === "game_over") {
            let winner = 'draw';
            if (data.winner === 1) winner = 'player';
            else if (data.winner === 2) winner = 'bot';

            setGameOver({
                isOpen: true,
                winner,
                finalScores: { player: data.score1, bot: data.score2 }
            });
        }
        if (data.type === "error") {
          alert("Error: " + data.message);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    wsRef.current.onclose = (event) => {
      console.log("WebSocket closed:", { code: event.code, reason: event.reason, wasClean: event.wasClean });
      setConnectionStatus("disconnected");
      if (!event.wasClean && gameStarted) {
        setConnectionError("Connection lost. Please refresh to reconnect.");
      }
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      clearInterval(timerRef.current);
    };
  }, [gameStarted, user.uid]);

  useEffect(() => {
    if (!gameStarted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          let winner = 'draw';
          if (scores.player > scores.bot) winner = 'player';
          else if (scores.bot > scores.player) winner = 'bot';
          setGameOver({
            isOpen: true,
            winner,
            finalScores: { player: scores.player, bot: scores.bot }
          });
          clearInterval(timerRef.current);
        }
        return newTime;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameStarted, scores]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="max-w-md w-full p-8 text-center">
          <div className="bg-slate-800/50 rounded-2xl p-8 ring-1 ring-white/10 shadow-2xl">
            <Trophy className="w-16 h-16 text-indigo-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Play vs Bot</h1>
            <p className="text-slate-300 mb-8">Test your skills against the AI in a standard 5-minute match.</p>
            <button
              onClick={startGame}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-lg shadow-indigo-500/25"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = turn === 1;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm lg:text-base"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Exit to Dashboard</span>
            <span className="sm:hidden">Exit</span>
          </button>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className={`font-mono text-base lg:text-lg ${timeLeft < 60 ? "text-red-400 animate-pulse" : ""}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Game Board */}
          <div className="flex-1">
            <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-xl font-semibold text-white">Game Board</h2>
                <div className="flex items-center gap-4">
                  <div className="text-slate-300 text-sm lg:text-base">{isMyTurn ? "Your Turn" : "Bot's Thinking..."}</div>
                  <div className={`w-3 h-3 rounded-full ${isMyTurn ? "bg-green-400 animate-pulse" : "bg-indigo-400"}`} />
                </div>
              </div>
              
              <div className="overflow-auto">
                <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg shadow-inner min-w-[600px] lg:min-w-0">
                  {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const multiplier = getCellMultiplier(rIdx, cIdx);
                      const hasTile = cell !== null;
                      const isCenter = rIdx === 7 && cIdx === 7;
                      
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                          onDragOver={allowDrop}
                          onClick={() => handleBoardClick(rIdx, cIdx)}
                          className={`w-8 h-8 lg:w-10 lg:h-10 flex flex-col items-center justify-center border-2 text-sm lg:text-lg font-bold rounded transition-all relative cursor-pointer ${
                            hasTile
                              ? "bg-slate-600 text-white border-slate-400"
                              : isCenter
                              ? "bg-gray-700 hover:bg-gray-600 border-gray-500"
                              : multiplier.type !== 'none'
                              ? `${multiplier.bg} hover:opacity-70 border-slate-400 ${multiplier.border} border-2`
                              : "bg-slate-600 hover:bg-slate-500 border-slate-500"
                          }`}
                        >
                          {cell || (multiplier.label && !hasTile) ? (
                            <span className={`${hasTile ? "text-white" : "text-[8px] lg:text-[10px] text-white/70"} font-bold uppercase`}>
                              {cell || multiplier.label}
                            </span>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-80 space-y-4 lg:space-y-6">
            {/* Players Status */}
            <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Players</h3>
              
              {/* You */}
              <div className={`p-3 lg:p-4 rounded-lg mb-3 ${isMyTurn ? "bg-indigo-500/20 ring-1 ring-indigo-400" : "bg-slate-700/50"}`}>
                <div className="flex items-center gap-3">
                  <img src={user.photoURL || "https://via.placeholder.com/40"} alt="You" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-indigo-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm lg:text-base truncate">{user.displayName || "You"}</div>
                    <div className="text-slate-400 text-xs">Human Player</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">{scores.player}</div>
                    <div className="text-slate-400 text-xs uppercase tracking-tighter">pts</div>
                  </div>
                </div>
              </div>

              {/* Bot */}
              <div className={`p-3 lg:p-4 rounded-lg ${!isMyTurn ? "bg-indigo-500/20 ring-1 ring-indigo-400" : "bg-slate-700/50"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-slate-600 flex items-center justify-center border-2 border-slate-400">
                    <span className="text-lg lg:text-xl">🤖</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm lg:text-base">Equatix Bot</div>
                    <div className="text-slate-400 text-xs">AI Level 1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold text-lg">{scores.bot}</div>
                    <div className="text-slate-400 text-xs uppercase tracking-tighter">pts</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rack */}
            <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base lg:text-lg font-semibold text-white">Your Rack</h3>
                {selectedTile && (
                  <span className="text-yellow-400 text-sm font-semibold">Selected: {selectedTile}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={isMyTurn && !!tile}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    onClick={() => handleTileClick(tile, idx)}
                    className={`w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center border-2 rounded text-lg font-bold shadow-md transition-all cursor-pointer ${
                      tile 
                        ? selectedTileIndex === idx
                          ? "bg-yellow-500 text-black border-yellow-400 scale-105"
                          : isMyTurn
                          ? "bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
                          : "bg-slate-500 text-white border-slate-400 cursor-not-allowed opacity-60"
                        : "bg-slate-600 border-slate-500"
                    }`}
                  >
                    {tile}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center lg:text-left">
                <p className="text-slate-400 text-sm">
                  {isMyTurn ? "Click a tile then click on the board to place it" : "Waiting for bot's move..."}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleSubmitMove}
                  disabled={!isMyTurn}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all text-sm lg:text-base ${
                    isMyTurn ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Submit Move
                </button>
                <button 
                  onClick={handleSwap}
                  disabled={!isMyTurn || !selectedTile}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition-all text-sm lg:text-base ${
                    selectedTile ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Swap Selected Tile
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={handlePass} disabled={!isMyTurn} className="bg-slate-600 hover:bg-slate-700 text-white py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-semibold disabled:opacity-50">
                    Pass Turn
                  </button>
                  <button onClick={handleReset} disabled={!isMyTurn} className="bg-red-600/80 hover:bg-red-700 text-white py-2 lg:py-3 rounded-lg text-xs lg:text-sm font-semibold disabled:opacity-50">
                    Reset Tiles
                  </button>
                </div>
              </div>
            </div>

            {/* Multiplier Legend */}
            <div className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10">
              <h3 className="text-base lg:text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
                Multipliers
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-red-600/50 border border-red-400 rounded flex items-center justify-center text-[6px] lg:text-[8px] text-white">3E</div>
                  <span className="text-[10px] lg:text-[12px] text-slate-300">Triple Eq</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-purple-600/50 border border-purple-400 rounded flex items-center justify-center text-[6px] lg:text-[8px] text-white">2E</div>
                  <span className="text-[10px] lg:text-[12px] text-slate-300">Double Eq</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-blue-600/50 border border-blue-400 rounded flex items-center justify-center text-[6px] lg:text-[8px] text-white">3L</div>
                  <span className="text-[10px] lg:text-[12px] text-slate-300">Triple Letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 lg:w-6 lg:h-6 bg-green-600/50 border border-green-400 rounded flex items-center justify-center text-[6px] lg:text-[8px] text-white">2L</div>
                  <span className="text-[10px] lg:text-[12px] text-slate-300">Double Letter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GameOverModal
          isOpen={gameOver.isOpen}
          winner={gameOver.winner}
          playerScore={gameOver.finalScores.player}
          opponentScore={gameOver.finalScores.bot}
          opponentName="Equatix Bot"
          onPlayAgain={() => window.location.reload()}
          onGoHome={() => navigate('/dashboard')}
        />
      </div>
    </div>
  );
};

export default BotGamePage;