import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Clock } from "lucide-react";

const BOARD_SIZE = 15;
const RACK_SIZE = 8;

const ChallengeGamePage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [scores, setScores] = useState({ player: 0, opponent: 0 });
  const [turn, setTurn] = useState(1);
  const [playerNumber, setPlayerNumber] = useState(null);
  const [selectedTiles, setSelectedTiles] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [status, setStatus] = useState("in_progress");

  const wsRef = useRef(null);
  const timerRef = useRef(null);

  const [opponent, setOpponent] = useState({
    name: "Opponent",
    photo: "https://via.placeholder.com/40",
    rating: 1250,
  });

  // Helper functions
  const allowDrop = (e) => e.preventDefault();

  const handleDragStart = (e, tile, rackIndex) => {
    if (turn !== playerNumber) return; // Not your turn
    e.dataTransfer.setData("tile", tile);
    e.dataTransfer.setData("rackIndex", rackIndex);
  };

  const handleDrop = (e, row, col) => {
    if (turn !== playerNumber) return; // Not your turn
    e.preventDefault();
    const tile = e.dataTransfer.getData("tile");
    const rackIndex = e.dataTransfer.getData("rackIndex");
    if (!tile) return;

    // Optimistic UI update
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

    // Send placement
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        type: "placement",
        payload: { row: row + 1, col: col + 1, value: tile },
      };
      wsRef.current.send(JSON.stringify(message));
    }
  };

  const sendCommand = (type, extra = {}) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, ...extra }));
    }
  };

  const handleSubmitMove = () => {
    if (turn !== playerNumber) return;
    sendCommand("evaluate");
  };

  const handlePass = () => {
    if (turn !== playerNumber) return;
    sendCommand("pass");
  };

  const handleReset = () => {
    if (turn !== playerNumber) return;
    sendCommand("reset");
  };

  const handleSwap = () => {
    if (turn !== playerNumber) return;
    if (selectedTiles.length > 0) {
      sendCommand("swap", { tiles: selectedTiles });
      setSelectedTiles([]);
    }
  };

  useEffect(() => {
    wsRef.current = new WebSocket(
      `ws://localhost:5555/echo?room_name=${challengeId}&isBot=0`
    );

    wsRef.current.onopen = () => console.log("WebSocket connected");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);

        if (data.type === "init" && Array.isArray(data.rack)) {
          setRack(data.rack);
          setTurn(data.turn);
          setPlayerNumber(data.sent); // ← player number from backend
        }

        if (data.type === "rack" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }

        if (data.type === "state") {
          if(playerNumber === 1) {
          setScores({
            player: data["Player1 Score"] || 0,
            opponent: data["Player2 Score"] || 0,
          });
          } else if(playerNumber == 2) {
                      setScores({
            player: data["Player2 Score"] || 0,
            opponent: data["Player1 Score"] || 0,
          });
          }

          setTurn(data.turn);

          const newBoard = Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));

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
          setStatus("finished");
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

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      wsRef.current?.close();
      clearInterval(timerRef.current);
    };
  }, [challengeId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isMyTurn = turn === playerNumber;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/challenges")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Challenges
          </button>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
            <div className="text-slate-400">
              Challenge #{challengeId?.slice(-6)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Game Board</h2>
                <div className="flex items-center gap-4">
                  <div className="text-slate-300">
                    {isMyTurn ? "Your Turn" : "Opponent's Turn"}
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isMyTurn ? "bg-green-400 animate-pulse" : "bg-red-400"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg">
                {board.map((row, rIdx) =>
                  row.map((cell, cIdx) => (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                      onDragOver={allowDrop}
                      className={`w-10 h-10 flex items-center justify-center border border-slate-500 text-lg font-bold text-white rounded ${
                        rIdx === Math.floor(BOARD_SIZE / 2) &&
                        cIdx === Math.floor(BOARD_SIZE / 2)
                          ? "bg-gray-700"
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                    >
                      {cell}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            {/* Players */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Players</h3>

              {/* You */}
              <div
                className={`p-3 rounded-lg ${
                  isMyTurn
                    ? "bg-indigo-500/20 ring-1 ring-indigo-400"
                    : "bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user?.photoURL || "https://via.placeholder.com/40"}
                    alt="You"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-white font-semibold">You</div>
                    <div className="text-slate-400 text-sm">
                      Rating: {user?.rating || 1250}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-white font-bold text-lg">
                      {scores.player}
                    </div>
                    <div className="text-slate-400 text-sm">points</div>
                  </div>
                </div>
              </div>

              {/* Opponent */}
              <div
                className={`p-3 rounded-lg ${
                  !isMyTurn
                    ? "bg-indigo-500/20 ring-1 ring-indigo-400"
                    : "bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={opponent.photo}
                    alt="Opponent"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="text-white font-semibold">
                      {opponent.name}
                    </div>
                    <div className="text-slate-400 text-sm">
                      Rating: {opponent.rating}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="text-white font-bold text-lg">
                      {scores.opponent}
                    </div>
                    <div className="text-slate-400 text-sm">points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rack */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Your Tiles
              </h3>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={isMyTurn && !!tile}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    onClick={() => {
                      if (!isMyTurn || !tile) return;
                      setSelectedTiles((prev) =>
                        prev.includes(tile)
                          ? prev.filter((t) => t !== tile)
                          : [...prev, tile]
                      );
                    }}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile
                        ? selectedTiles.includes(tile)
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : isMyTurn
                          ? "cursor-move bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
                          : "bg-slate-500 text-white border-slate-400 cursor-not-allowed opacity-60"
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
                  onClick={handleSubmitMove}
                  disabled={!isMyTurn}
                  className={`w-full py-2 px-4 rounded-lg ${
                    isMyTurn
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Submit Move
                </button>
                <button
                  onClick={handleSwap}
                  disabled={!isMyTurn}
                  className={`w-full py-2 px-4 rounded-lg ${
                    isMyTurn
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Swap Tiles
                </button>
                <button
                  onClick={handlePass}
                  disabled={!isMyTurn}
                  className={`w-full py-2 px-4 rounded-lg ${
                    isMyTurn
                      ? "bg-slate-600 hover:bg-slate-700 text-white"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Pass Turn
                </button>
                <button
                  onClick={handleReset}
                  disabled={!isMyTurn}
                  className={`w-full py-2 px-4 rounded-lg ${
                    isMyTurn
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Reset Game
                </button>
              </div>
            </div>

            {/* Debug Info (optional) */}
            <div className="text-xs text-slate-500 mt-2">
              You are Player {playerNumber ?? "?"}, Turn: {turn}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeGamePage;
