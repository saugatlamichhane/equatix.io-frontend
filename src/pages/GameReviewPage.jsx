import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Clock, Info } from "lucide-react";
import { getCellMultiplier } from "../utils/multiplierCells";

const BOARD_SIZE = 15;

const GameReviewPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [currentMove, setCurrentMove] = useState(-1); // -1 is the initial empty board
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  // Reconstruct the board state up to the selected move
  const board = useMemo(() => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    if (!gameData || currentMove === -1) return newBoard;

    // Apply every move from index 0 up to currentMove
    for (let i = 0; i <= currentMove; i++) {
      const move = gameData.moves[i];
      if (move && move.tiles) {
        move.tiles.forEach((tile) => {
          // Assuming backend/storage uses 1-based indexing for row/col
          newBoard[tile.row - 1][tile.col - 1] = tile.value;
        });
      }
    }
    return newBoard;
  }, [gameData, currentMove]);

  useEffect(() => {
    fetchGameReview();
  }, [gameId]);

  useEffect(() => {
    let interval;
    if (isPlaying && gameData && currentMove < gameData.moves.length - 1) {
      interval = setInterval(() => {
        setCurrentMove((prev) => {
          if (prev < gameData.moves.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMove, gameData]);

  const fetchGameReview = async () => {
    try {
      setLoading(true);
      // Replace with your actual backend URL
      const response = await fetch(`https://equatix-backend.onrender.com/GameController/${gameId}/replay`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGameData({
        ...data,
        // Map backend fields to frontend names if they differ
        opponent: {
          name: data.player2_uid === user?.uid ? "Player 1" : "Opponent", // Simplify for now
          photo: "https://via.placeholder.com/150"
        },
        result: data.winner_uid === user?.uid ? "win" : "loss",
        finalScore: { 
            player: data.player1_uid === user?.uid ? data.final_score_p1 : data.final_score_p2, 
            opponent: data.player1_uid === user?.uid ? data.final_score_p2 : data.final_score_p1 
        },
        duration: 300, // Placeholder if duration isn't in DB
        moves: data.moves || []
      });
    } catch (error) {
      console.error("Failed to fetch game review:", error);
      alert("Failed to load game review: " + error.message);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMove = () => {
    if (currentMove >= 0) {
      setCurrentMove(currentMove - 1);
      setIsPlaying(false);
    }
  };

  const handleNextMove = () => {
    if (gameData && currentMove < gameData.moves.length - 1) {
      setCurrentMove(currentMove + 1);
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (gameData && currentMove >= gameData.moves.length - 1) {
      setCurrentMove(-1);
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading game review...</div>
      </div>
    );
  }

  if (!gameData) return null;

  const progress = gameData.moves.length > 0 
    ? ((currentMove + 1) / gameData.moves.length) * 100 
    : 0;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-white">Game Review</h1>
          <div className="w-32"></div>
        </div>

        {/* Game Info Card */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img
                  src={user?.photoURL || "https://via.placeholder.com/50"}
                  alt="You"
                  className="w-12 h-12 rounded-full ring-2 ring-indigo-500"
                />
                <div>
                  <p className="text-white font-semibold">You</p>
                  <p className="text-slate-400 text-sm">Score: {gameData.finalScore.player}</p>
                </div>
              </div>
              <div className="text-slate-500 font-bold text-xl">VS</div>
              <div className="flex items-center gap-3">
                <img
                  src={gameData.opponent.photo}
                  alt="Opponent"
                  className="w-12 h-12 rounded-full ring-2 ring-purple-500"
                />
                <div>
                  <p className="text-white font-semibold">{gameData.opponent.name}</p>
                  <p className="text-slate-400 text-sm">Score: {gameData.finalScore.opponent}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-black italic tracking-tighter ${
                gameData.result === 'win' ? 'text-green-400' : 'text-red-400'
              }`}>
                {gameData.result.toUpperCase()}
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(gameData.duration)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replay Controls */}
        <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMove}
                disabled={currentMove === -1}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 transition-colors shadow-md"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all shadow-md active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleNextMove}
                disabled={currentMove >= gameData.moves.length - 1}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 transition-colors shadow-md"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-slate-300 font-mono text-sm">
              Move {currentMove + 1} of {gameData.moves.length}
            </div>
          </div>
        </div>

        {/* Main Display Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board Replay */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 shadow-2xl overflow-auto">
            <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg shadow-inner">
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const multiplier = getCellMultiplier(rIdx + 1, cIdx + 1);
                  const isCurrentMoveTile = currentMove >= 0 && 
                    gameData.moves[currentMove].tiles.some(t => t.row === rIdx + 1 && t.col === cIdx + 1);

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-8 h-8 lg:w-10 lg:h-10 flex flex-col items-center justify-center border-2 text-xs lg:text-sm font-bold rounded transition-all duration-300 ${
                        cell
                          ? isCurrentMoveTile 
                            ? "bg-yellow-500 text-black border-yellow-300 scale-110 z-10 shadow-lg animate-pulse" 
                            : "bg-indigo-600 text-white border-indigo-400"
                          : multiplier.type !== 'none'
                            ? `${multiplier.bg} ${multiplier.border} opacity-50`
                            : "bg-slate-600 border-slate-500 opacity-30"
                      }`}
                    >
                      {cell || (multiplier.label && !cell ? multiplier.label : "")}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Move History Sidebar */}
          <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 flex flex-col h-full shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">Move History</h3>
            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
              {gameData.moves.map((move, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentMove(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    idx === currentMove
                      ? 'bg-indigo-500/30 border-2 border-indigo-500 shadow-indigo-500/20 shadow-lg'
                      : 'bg-slate-700/50 hover:bg-slate-700 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">
                        Move {idx + 1}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {move.tiles.map(t => t.value).join(' ')} 
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-bold">+{move.score}</span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Points</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                <span>Current Step's Move</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
                <span>Previous Move</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReviewPage;