import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Clock, Trophy, User } from "lucide-react";

const BOARD_SIZE = 15;
const RACK_SIZE = 8;

const ChallengeGamePage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [gameState, setGameState] = useState({
    board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)),
    rack: Array(RACK_SIZE).fill(null),
    currentPlayer: user?.uid,
    scores: { player: 0, opponent: 0 },
    timeLeft: 300, // 5 minutes
    status: "in_progress"
  });
  
  const [opponent, setOpponent] = useState({
    name: "Opponent",
    photo: "https://via.placeholder.com/40",
    rating: 1250
  });

  const wsRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Initialize WebSocket connection for real-time gameplay
    wsRef.current = new WebSocket(`ws://localhost:5555/game/${challengeId}`);
    
    wsRef.current.onopen = () => {
      console.log("Connected to game room");
    };
    
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleGameUpdate(data);
    };

    // Start game timer
    timerRef.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        timeLeft: Math.max(0, prev.timeLeft - 1)
      }));
    }, 1000);

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [challengeId]);

  const handleGameUpdate = (data) => {
    switch (data.type) {
      case "move":
        setGameState(prev => ({
          ...prev,
          board: data.board,
          currentPlayer: data.currentPlayer,
          scores: data.scores
        }));
        break;
      case "game_end":
        setGameState(prev => ({ ...prev, status: "finished" }));
        break;
      default:
        break;
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
    
    if (!tile || gameState.currentPlayer !== user?.uid) return;

    // Update local state
    setGameState(prev => {
      const newBoard = prev.board.map(r => [...r]);
      const newRack = [...prev.rack];
      
      if (newBoard[row][col] === null) {
        newBoard[row][col] = tile;
        newRack[rackIndex] = null;
      }
      
      return {
        ...prev,
        board: newBoard,
        rack: newRack
      };
    });

    // Send move to server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "move",
        row,
        col,
        tile,
        rackIndex
      }));
    }
  };

  const allowDrop = (e) => e.preventDefault();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
              <span className="font-mono text-lg">
                {formatTime(gameState.timeLeft)}
              </span>
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
                    {gameState.currentPlayer === user?.uid ? "Your Turn" : "Opponent's Turn"}
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    gameState.currentPlayer === user?.uid ? "bg-green-400" : "bg-red-400"
                  }`} />
                </div>
              </div>
              
              <div className="grid grid-cols-15 gap-0.5 bg-slate-700 p-2 rounded-lg">
                {gameState.board.map((row, rIdx) =>
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

          {/* Game Info */}
          <div className="space-y-6">
            {/* Players */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Players</h3>
              
              <div className="space-y-4">
                {/* You */}
                <div className={`p-3 rounded-lg ${
                  gameState.currentPlayer === user?.uid ? "bg-indigo-500/20 ring-1 ring-indigo-400" : "bg-slate-700/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.photoURL || "https://via.placeholder.com/40"}
                      alt="You"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-white font-semibold">You</div>
                      <div className="text-slate-400 text-sm">Rating: {user?.rating || 1250}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-white font-bold text-lg">{gameState.scores.player}</div>
                      <div className="text-slate-400 text-sm">points</div>
                    </div>
                  </div>
                </div>

                {/* Opponent */}
                <div className={`p-3 rounded-lg ${
                  gameState.currentPlayer !== user?.uid ? "bg-indigo-500/20 ring-1 ring-indigo-400" : "bg-slate-700/50"
                }`}>
                  <div className="flex items-center gap-3">
                    <img
                      src={opponent.photo}
                      alt="Opponent"
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="text-white font-semibold">{opponent.name}</div>
                      <div className="text-slate-400 text-sm">Rating: {opponent.rating}</div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="text-white font-bold text-lg">{gameState.scores.opponent}</div>
                      <div className="text-slate-400 text-sm">points</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Tiles */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Your Tiles</h3>
              <div className="flex flex-wrap gap-2">
                {gameState.rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={!!tile && gameState.currentPlayer === user?.uid}
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

            {/* Actions */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-3">
                <button 
                  disabled={gameState.currentPlayer !== user?.uid}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Submit Move
                </button>
                <button 
                  disabled={gameState.currentPlayer !== user?.uid}
                  className="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Pass Turn
                </button>
                <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-colors">
                  Forfeit Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeGamePage;
