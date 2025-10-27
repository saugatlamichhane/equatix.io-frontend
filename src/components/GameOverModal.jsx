import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GameOverModal = ({ 
  isOpen, 
  winner, 
  playerScore, 
  opponentScore, 
  opponentName,
  onPlayAgain,
  onGoHome
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const isPlayerWinner = winner === 'player';
  const isOpponentWinner = winner === 'opponent';
  const isDraw = winner === 'draw';

  const getWinnerText = () => {
    if (isPlayerWinner) return "🎉 You Won!";
    if (isOpponentWinner) return "😔 You Lost";
    if (isDraw) return "🤝 It's a Draw!";
    return "Game Over";
  };

  const getWinnerColor = () => {
    if (isPlayerWinner) return "text-green-400";
    if (isOpponentWinner) return "text-red-400";
    if (isDraw) return "text-yellow-400";
    return "text-slate-400";
  };

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full ring-1 ring-white/20 shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-yellow-400" />
          </div>
          <h2 className={`text-4xl font-bold ${getWinnerColor()} mb-2`}>
            {getWinnerText()}
          </h2>
          <p className="text-slate-400">
            vs {opponentName}
          </p>
        </div>

        {/* Score Display */}
        <div className="bg-slate-700/50 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 text-center">Final Scores</h3>
          
          <div className="space-y-4">
            {/* Player Score */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              isPlayerWinner ? 'bg-green-500/20 ring-2 ring-green-400' : 'bg-slate-600/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                  You
                </div>
                <div>
                  <div className="text-white font-semibold">You</div>
                  <div className="text-slate-400 text-sm">Player</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-2xl">{playerScore}</div>
                <div className="text-slate-400 text-sm">points</div>
              </div>
            </div>

            {/* Opponent Score */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              isOpponentWinner ? 'bg-green-500/20 ring-2 ring-green-400' : 'bg-slate-600/50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {opponentName?.charAt(0) || 'O'}
                </div>
                <div>
                  <div className="text-white font-semibold">{opponentName}</div>
                  <div className="text-slate-400 text-sm">Opponent</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-2xl">{opponentScore}</div>
                <div className="text-slate-400 text-sm">points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Play Again Button */}
          {onPlayAgain && (
            <button
              onClick={onPlayAgain}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 px-6 rounded-xl transition-colors font-semibold flex items-center justify-center gap-3 shadow-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Play Again
            </button>
          )}

          {/* Go Home Button */}
          <button
            onClick={onGoHome || handleGoHome}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default GameOverModal;
