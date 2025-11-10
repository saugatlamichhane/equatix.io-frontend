import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Eye, Users } from "lucide-react";
import { getCellMultiplier } from "../utils/multiplierCells";

const BOARD_SIZE = 15;

const SpectatorGamePage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [board, setBoard] = useState(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [turn, setTurn] = useState(1);
  const [status, setStatus] = useState("connecting");
  const [spectatorCount, setSpectatorCount] = useState(1); // At least yourself
  const [playerInfo, setPlayerInfo] = useState({
    player1: { name: "Player 1", photo: "https://via.placeholder.com/40" },
    player2: { name: "Player 2", photo: "https://via.placeholder.com/40" }
  });

  const wsRef = useRef(null);

  useEffect(() => {
    // Connect as spectator - use localhost for local development
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NODE_ENV === 'production' 
      ? 'equatix-backend.onrender.com' 
      : 'localhost:5555';
    const wsUrl = `${wsProtocol}//${wsHost}/echo?room_name=${roomId}&mode=spectator`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("Spectator WebSocket connected");
      setStatus("connected");
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Spectator message:", data);

        if (data.type === "init") {
          setStatus("watching");
          if (data.isSpectator) {
            // Initialize board from current game state
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
            setScores({
              player1: data["Player1 Score"] || 0,
              player2: data["Player2 Score"] || 0,
            });
            setTurn(data.turn || 1);
          }
        }

        if (data.type === "state") {
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
          setScores({
            player1: data["Player1 Score"] || 0,
            player2: data["Player2 Score"] || 0,
          });
          setTurn(data.turn || 1);
        }

        if (data.type === "game_over") {
          setStatus("finished");
        }

        if (data.type === "error") {
          console.error("Error:", data.message);
          if (data.message.includes("cannot perform")) {
            // Ignore - this is expected for spectators
          } else {
            alert("Error: " + data.message);
          }
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    wsRef.current.onclose = () => {
      console.log("Spectator WebSocket disconnected");
      setStatus("disconnected");
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("error");
    };

    return () => {
      wsRef.current?.close();
    };
  }, [roomId]);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-lg border border-purple-400/30">
              <Eye className="w-5 h-5 text-purple-300" />
              <span className="text-purple-200 font-semibold">Spectator Mode</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-5 h-5" />
              <span>{spectatorCount} watching</span>
            </div>
          </div>
        </div>

        {status === "connecting" && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-300">Connecting to game...</p>
            </div>
          </div>
        )}

        {status === "disconnected" && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-400 mb-4">Connection lost</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white"
              >
                Reconnect
              </button>
            </div>
          </div>
        )}

        {status === "watching" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-3">
              <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Game Board</h2>
                  <div className="text-slate-300">
                    {turn === 1 ? "Player 1's Turn" : "Player 2's Turn"}
                  </div>
                </div>
                
                <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg">
                  {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => {
                      const multiplier = getCellMultiplier(rIdx, cIdx);
                      const hasTile = cell !== null;
                      const isCenter = rIdx === Math.floor(BOARD_SIZE / 2) &&
                        cIdx === Math.floor(BOARD_SIZE / 2);
                      
                      return (
                        <div
                          key={`${rIdx}-${cIdx}`}
                          className={`w-10 h-10 flex flex-col items-center justify-center border-2 text-lg font-bold rounded transition-all relative ${
                            hasTile
                              ? "bg-slate-600 text-white border-slate-400"
                              : isCenter
                              ? "bg-gray-700 border-gray-500"
                              : multiplier.type !== 'none'
                              ? `${multiplier.bg} border-slate-400 ${multiplier.border} border-2`
                              : "bg-slate-600 border-slate-500"
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

            {/* Side Info */}
            <div className="space-y-6">
              {/* Players */}
              <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
                
                {/* Player 1 */}
                <div
                  className={`p-3 rounded-lg mb-3 ${
                    turn === 1
                      ? "bg-indigo-500/20 ring-1 ring-indigo-400"
                      : "bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={playerInfo.player1.photo}
                      alt="Player 1"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold">{playerInfo.player1.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {scores.player1}
                      </div>
                      <div className="text-slate-400 text-sm">points</div>
                    </div>
                  </div>
                </div>

                {/* Player 2 */}
                <div
                  className={`p-3 rounded-lg ${
                    turn === 2
                      ? "bg-indigo-500/20 ring-1 ring-indigo-400"
                      : "bg-slate-700/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={playerInfo.player2.photo}
                      alt="Player 2"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold">{playerInfo.player2.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold text-lg">
                        {scores.player2}
                      </div>
                      <div className="text-slate-400 text-sm">points</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spectator Info */}
              <div className="bg-purple-900/20 rounded-xl p-6 ring-1 ring-purple-400/30">
                <h3 className="text-lg font-semibold text-purple-200 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Spectator Mode
                </h3>
                <p className="text-purple-300 text-sm">
                  You are watching this game in real-time. You can see all moves and scores,
                  but cannot interact with the game.
                </p>
              </div>

              {/* Game Info */}
              <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Game Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Room ID:</span>
                    <span className="text-white font-mono">{roomId?.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-green-400 capitalize">{status}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpectatorGamePage;

