import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Puzzle, Plus, Settings, Trophy, Clock, Target } from "lucide-react";
import api from "../utils/api";

const PuzzlesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  // Check if user is admin/developer (This variable is now ignored for the button display)
  const isAdmin = user?.email?.includes("admin") || user?.email?.includes("dev") || localStorage.getItem("isAdmin") === "true";

  useEffect(() => {
    fetchPuzzles();
    fetchUserProgress();
  }, []);

  const fetchPuzzles = async () => {
    try {
      setLoading(true);
      
      // Fetch puzzles from backend using the new endpoint
      try {
        const res = await api.get("/puzzles");
        // Backend returns: [{puzzle_id, difficulty, objective, solved}, ...]
        const backendPuzzles = res.data.map(puzzle => ({
          id: puzzle.puzzle_id,
          puzzle_id: puzzle.puzzle_id,
          difficulty: puzzle.difficulty,
          objective: puzzle.objective,
          solved: puzzle.solved || false,
          name: `Puzzle ${puzzle.puzzle_id}`,
          description: puzzle.objective || "Solve the puzzle by placing tiles correctly"
        }));
        setPuzzles(backendPuzzles);
        
        // Update userProgress based on solved status
        const progress = {};
        backendPuzzles.forEach(puzzle => {
          if (puzzle.solved) {
            progress[puzzle.id] = { completed: true };
          }
        });
        setUserProgress(progress);
      } catch (err) {
        console.error("Failed to fetch puzzles from backend:", err);
        // Fallback to localStorage if backend fails
        const savedPuzzles = JSON.parse(localStorage.getItem("puzzles") || "[]");
        setPuzzles(savedPuzzles);
      }
    } catch (error) {
      console.error("Failed to fetch puzzles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    // Progress is now included in the /puzzles endpoint response
    // This function is kept for backward compatibility but progress
    // is now handled in fetchPuzzles()
    if (!user) return;
  };

  const handlePuzzleClick = (puzzleId) => {
    navigate(`/puzzle/${puzzleId}`);
  };

  const handleCreatePuzzle = () => {
    // Navigate to the puzzle admin/creation page
    navigate("/puzzle/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading puzzles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm lg:text-base"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <Puzzle className="w-6 h-6 lg:w-8 lg:h-8" />
              Puzzles
            </h1>
            <button
              onClick={() => navigate("/puzzles/daily")}
              className="px-3 py-2 lg:px-4 lg:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm lg:text-base"
            >
              <Trophy className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">Daily Puzzles</span>
              <span className="sm:hidden">Daily</span>
            </button>
          </div>
          {/* CREATE PUZZLE BUTTON - NOW SHOWN TO EVERYONE */}
          <button
            onClick={handleCreatePuzzle}
            className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg transition-colors text-sm lg:text-base"
          >
            <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Create Puzzle</span>
            <span className="sm:hidden">Create</span>
          </button>
        </div>

        {/* Puzzles Grid */}
        {puzzles.length === 0 ? (
          <div className="bg-slate-800/50 rounded-xl p-8 lg:p-12 text-center ring-1 ring-white/10">
            <Puzzle className="w-12 h-12 lg:w-16 lg:h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-base lg:text-lg mb-2">No puzzles available yet</p>
            {/* CREATE PUZZLE BUTTON - NOW SHOWN TO EVERYONE (empty state) */}
            <button
              onClick={handleCreatePuzzle}
              className="mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 lg:px-6 lg:py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Create Your First Puzzle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {puzzles.map((puzzle, index) => {
              const isCompleted = puzzle.solved || userProgress[puzzle.id]?.completed || false;

              return (
                <div
                  key={puzzle.puzzle_id || puzzle.id || index}
                  onClick={() => handlePuzzleClick(puzzle.puzzle_id || puzzle.id || `puzzle-${index + 1}`)}
                  className="bg-slate-800/50 rounded-xl p-4 lg:p-6 ring-1 ring-white/10 hover:bg-slate-800/70 transition-all cursor-pointer hover:ring-indigo-500/50 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-3 lg:mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg lg:text-xl">
                        {puzzle.puzzle_id || index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {puzzle.name || `Puzzle ${puzzle.puzzle_id || index + 1}`}
                        </h3>
                        <p className="text-sm text-slate-400 capitalize">
                          {puzzle.difficulty || "medium"}
                        </p>
                      </div>
                    </div>
                    {isCompleted && (
                      <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        Completed
                      </div>
                    )}
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {puzzle.objective || puzzle.description || "Solve the puzzle by placing tiles correctly"}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-yellow-400" />
                        <span>Objective: {puzzle.objective || "Complete the puzzle"}</span>
                      </div>
                    </div>
                    <div className="text-indigo-400 font-medium">Play →</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzlesPage;