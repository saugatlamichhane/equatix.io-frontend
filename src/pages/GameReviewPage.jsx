import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Clock, Trophy, Users } from "lucide-react";

const GameReviewPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gameData, setGameData] = useState(null);
  const [currentMove, setCurrentMove] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

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
      }, 2000); // 2 seconds per move
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMove, gameData]);

  const fetchGameReview = async () => {
    // TODO: Replace with real API call when backend endpoint is ready
    // GET /game/{gameId}/replay
    try {
      setLoading(true);
      
      // Mock game review data
      const mockGameData = {
        gameId: gameId,
        opponent: {
          uid: "uid-123",
          name: "MathMaster123",
          photo: "https://via.placeholder.com/150"
        },
        result: "win",
        finalScore: { player: 150, opponent: 120 },
        duration: 450, // seconds
        date: "2025-11-14T10:30:00Z",
        variant: "normal",
        moves: [
          {
            turn: 1,
            player: 1,
            tiles: [{ row: 7, col: 7, value: "5" }, { row: 7, col: 8, value: "+" }, { row: 7, col: 9, value: "3" }],
            score: 8,
            timestamp: "2025-11-14T10:30:15Z",
            boardState: "initial"
          },
          {
            turn: 2,
            player: 2,
            tiles: [{ row: 8, col: 7, value: "2" }, { row: 8, col: 8, value: "*" }, { row: 8, col: 9, value: "4" }],
            score: 8,
            timestamp: "2025-11-14T10:30:45Z"
          },
          {
            turn: 3,
            player: 1,
            tiles: [{ row: 6, col: 7, value: "1" }, { row: 6, col: 8, value: "0" }],
            score: 10,
            timestamp: "2025-11-14T10:31:20Z"
          },
          {
            turn: 4,
            player: 2,
            tiles: [{ row: 9, col: 7, value: "=" }, { row: 9, col: 8, value: "8" }],
            score: 8,
            timestamp: "2025-11-14T10:32:00Z"
          }
        ]
      };

      setGameData(mockGameData);
    } catch (error) {
      console.error("Failed to fetch game review:", error);
      alert("Failed to load game review");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMove = () => {
    if (currentMove > 0) {
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
      setCurrentMove(0);
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

  if (!gameData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-red-400">Game not found</div>
      </div>
    );
  }

  const currentMoveData = gameData.moves[currentMove];
  const progress = ((currentMove + 1) / gameData.moves.length) * 100;

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

        {/* Game Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
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
              <div className="text-slate-400">vs</div>
              <div className="flex items-center gap-3">
                <img
                  src={gameData.opponent.photo}
                  alt={gameData.opponent.name}
                  className="w-12 h-12 rounded-full ring-2 ring-purple-500"
                />
                <div>
                  <p className="text-white font-semibold">{gameData.opponent.name}</p>
                  <p className="text-slate-400 text-sm">Score: {gameData.finalScore.opponent}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                gameData.result === 'win' ? 'text-green-400' : 
                gameData.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {gameData.result.toUpperCase()}
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-sm mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(gameData.duration)}
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  {gameData.variant}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Replay Controls */}
        <div className="bg-slate-800/50 rounded-xl p-4 ring-1 ring-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePreviousMove}
                disabled={currentMove === 0}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <button
                onClick={handleNextMove}
                disabled={!gameData || currentMove >= gameData.moves.length - 1}
                className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-slate-700 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="text-slate-300 text-sm">
              Move {currentMove + 1} of {gameData.moves.length}
            </div>
          </div>
        </div>

        {/* Current Move Display */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Board Preview */}
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Move {currentMove + 1}</h3>
            <div className="bg-slate-900 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm mb-2">
                Player {currentMoveData.player} placed:
              </p>
              <div className="flex gap-2 flex-wrap">
                {currentMoveData.tiles.map((tile, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-indigo-500 text-white rounded-lg font-bold"
                  >
                    {tile.value} ({tile.row}, {tile.col})
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="text-slate-300">
                  Score this move: <span className="text-green-400 font-bold">+{currentMoveData.score}</span>
                </div>
                <div className="text-slate-400 text-sm">
                  {new Date(currentMoveData.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              <p>💡 Board state visualization would go here</p>
              <p className="mt-2">(Full board replay requires backend game state storage)</p>
            </div>
          </div>

          {/* Move History */}
          <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Move History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {gameData.moves.map((move, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentMove(idx);
                    setIsPlaying(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    idx === currentMove
                      ? 'bg-indigo-500/20 border-2 border-indigo-500'
                      : 'bg-slate-700/50 hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium text-sm">
                        Move {move.turn} - Player {move.player}
                      </p>
                      <p className="text-slate-400 text-xs">
                        +{move.score} points
                      </p>
                    </div>
                    {idx === currentMove && (
                      <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameReviewPage;

