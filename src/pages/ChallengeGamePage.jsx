import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Clock, Info } from "lucide-react";
import GameOverModal from "../components/GameOverModal";
import { getCellMultiplier } from "../utils/multiplierCells";

const BOARD_SIZE = 15;
const RACK_SIZE = 10;

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
  const [selectedTileIndices, setSelectedTileIndices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [status, setStatus] = useState("waiting"); // Start as waiting, will update when game starts
  const [opponentConnected, setOpponentConnected] = useState(false);
  
  const [gameOver, setGameOver] = useState({
    isOpen: false,
    winner: null,
    finalScores: { player: 0, opponent: 0 }
  });

  const wsRef = useRef(null);
  const timerRef = useRef(null);
const playerNumberRef = useRef(null); // 👈 add this line here
useEffect(() => {
  playerNumberRef.current = playerNumber;
}, [playerNumber]);

  
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
    if (selectedTileIndices.length > 0) {
      // Get actual tile values from the rack using indices
      const tilesToSwap = selectedTileIndices.map(idx => rack[idx]).filter(tile => tile !== null);
      if (tilesToSwap.length > 0) {
        sendCommand("swap", { tiles: tilesToSwap });
        setSelectedTileIndices([]);
      }
    }
  };

  useEffect(() => {
    wsRef.current = new WebSocket(
      `wss://equatix-backend.onrender.com/echo?room_name=challenge${challengeId}`
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
          setStatus("in_progress"); // Start the game
          setOpponentConnected(true);
          
          console.log("Initialized:", { 
            playerNumber: data.sent, 
            turn: data.turn, 
            rackLength: data.rack.length 
          });
        }

        if (data.type === "rack" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }

        if (data.type === "state") {
          // State updates mean both players are connected and the game is active
          setOpponentConnected(true);
  if (playerNumberRef.current === 1) {
    setScores({
      player: data["Player1 Score"] || 0,
      opponent: data["Player2 Score"] || 0,
    });
  } else if (playerNumberRef.current === 2) {
    setScores({
      player: data["Player2 Score"] || 0,
      opponent: data["Player1 Score"] || 0,
    });
  }
          console.log(playerNumber);
          console.log(turn);
          console.log(data["Player1 Score"]);
          console.log(data["Player2 Score"]);

          setTurn(data.turn);
          console.log("Turn updated from state:", { 
            currentTurn: data.turn, 
            playerNumber, 
            isMyTurn: data.turn === playerNumber 
          });

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
          
          // Determine winner based on final scores
          const playerScore = scores.player;
          const opponentScore = scores.opponent;
          
          let winner = 'draw';
          if (playerScore > opponentScore) winner = 'player';
          else if (opponentScore > playerScore) winner = 'opponent';
          
          setGameOver({
            isOpen: true,
            winner,
            finalScores: { player: playerScore, opponent: opponentScore }
          });
        }

        if (data.type === "error") {
          alert("Error: " + data.message);
        }
      } catch (err) {
        console.error("Invalid WS message:", err);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket disconnected");

    return () => {
      wsRef.current?.close();
      clearInterval(timerRef.current);
    };
  }, [challengeId]);

  // Separate effect for timer that runs when status changes to "in_progress"
  useEffect(() => {
    if (status === "in_progress" && !timerRef.current) {
      console.log("Starting game timer");
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = Math.max(0, prev - 1);
          
          // If time runs out and game is still in progress, end the game
          if (newTime === 0) {
            const playerScore = scores.player;
            const opponentScore = scores.opponent;
            
            let winner = 'draw';
            if (playerScore > opponentScore) winner = 'player';
            else if (opponentScore > playerScore) winner = 'opponent';
            
            setGameOver({
              isOpen: true,
              winner,
              finalScores: { player: playerScore, opponent: opponentScore }
            });
            setStatus("finished");
          }
          
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (status !== "in_progress" && timerRef.current) {
        console.log("Clearing game timer");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]); // Only start timer when status becomes "in_progress"

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayAgain = () => {
    // For now, just close the modal and keep state
    // In production, you might want to navigate to start a new challenge
    setGameOver({
      isOpen: false,
      winner: null,
      finalScores: { player: 0, opponent: 0 }
    });
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  // Better turn detection: if playerNumber is 1, then turn 1 is their turn
  // if playerNumber is 2, then turn 2 is their turn
  const isMyTurn = turn === playerNumber;
  
  console.log("Turn state:", { 
    turn, 
    playerNumber, 
    isMyTurn, 
    condition: `${turn} === ${playerNumber}` 
  });

  // Show waiting room if status is "waiting" (waiting for opponent to join)
  if (status === "waiting" && playerNumber === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="max-w-md w-full p-8">
          <div className="bg-slate-800/50 rounded-2xl p-8 ring-1 ring-white/10 shadow-2xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Connecting...</h2>
            <p className="text-slate-300 mb-6">
              Joining the game room...
            </p>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Establishing connection</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  row.map((cell, cIdx) => {
                    const multiplier = getCellMultiplier(rIdx, cIdx);
                    const hasTile = cell !== null;
                    const isCenter = rIdx === Math.floor(BOARD_SIZE / 2) &&
                      cIdx === Math.floor(BOARD_SIZE / 2);
                    
                    return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onDrop={(e) => handleDrop(e, rIdx, cIdx)}
                      onDragOver={allowDrop}
                        className={`w-10 h-10 flex flex-col items-center justify-center border-2 text-lg font-bold rounded transition-all relative ${
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Your Tiles
                </h3>
                {selectedTileIndices.length > 0 && (
                  <span className="text-yellow-400 text-sm font-semibold">
                    {selectedTileIndices.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {rack.map((tile, idx) => (
                  <div
                    key={idx}
                    draggable={isMyTurn && !!tile}
                    onDragStart={(e) => handleDragStart(e, tile, idx)}
                    onClick={() => {
                      if (!isMyTurn || !tile) return;
                      setSelectedTileIndices((prev) =>
                        prev.includes(idx)
                          ? prev.filter((i) => i !== idx)
                          : [...prev, idx]
                      );
                    }}
                    className={`w-10 h-10 flex items-center justify-center border rounded text-lg font-bold shadow-md transition-all ${
                      tile 
                        ? selectedTileIndices.includes(idx)
                          ? "bg-yellow-500 text-black border-yellow-400"
                          : isMyTurn
                          ? "cursor-pointer bg-indigo-500 text-white border-indigo-400 hover:bg-indigo-600"
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
                  disabled={!isMyTurn || selectedTileIndices.length === 0}
                  className={`w-full py-2 px-4 rounded-lg ${
                    selectedTileIndices.length === 0
                      ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                      : isMyTurn
                      ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                      : "bg-slate-600 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {selectedTileIndices.length > 0 
                    ? `Swap ${selectedTileIndices.length} Tile${selectedTileIndices.length > 1 ? 's' : ''}` 
                    : 'Select tiles to swap'}
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

            {/* Multiplier Legend */}
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Board Multipliers
              </h3>
              
              <div className="space-y-3">
                {/* Triple Equation */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-600/50 border-2 border-red-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">3x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Triple Equation (3x)</div>
                    <div className="text-slate-400 text-xs">Entire equation ×3</div>
                  </div>
                </div>

                {/* Double Equation */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600/50 border-2 border-purple-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Double Equation (2x)</div>
                    <div className="text-slate-400 text-xs">Entire equation ×2</div>
                  </div>
                </div>

                {/* Triple Tile */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600/50 border-2 border-blue-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">3x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Triple Tile (3x)</div>
                    <div className="text-slate-400 text-xs">Single tile ×3</div>
                  </div>
                </div>

                {/* Double Tile */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600/50 border-2 border-green-400 rounded flex items-center justify-center">
                    <span className="text-xs font-bold text-white">2x</span>
                  </div>
                  <div>
                    <div className="text-white text-sm font-semibold">Double Tile (2x)</div>
                    <div className="text-slate-400 text-xs">Single tile ×2</div>
                  </div>
                </div>

                {/* Tip */}
                <div className="mt-4 p-3 bg-indigo-500/20 rounded-lg border border-indigo-400/30">
                  <p className="text-indigo-300 text-xs">
                    💡 <strong>Tip:</strong> Place tiles on colored cells for bonus points!
                  </p>
                </div>
              </div>
            </div>

            {/* Debug Info (optional) */}
            <div className="text-xs text-slate-500 mt-2">
              You are Player {playerNumber ?? "?"}, Turn: {turn}
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={gameOver.isOpen}
        winner={gameOver.winner}
        playerScore={gameOver.finalScores.player}
        opponentScore={gameOver.finalScores.opponent}
        opponentName={opponent.name}
        onPlayAgain={handlePlayAgain}
        onGoHome={handleGoHome}
      />
    </div>
  );
};

export default ChallengeGamePage;
