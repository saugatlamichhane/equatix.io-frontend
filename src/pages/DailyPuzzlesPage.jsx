import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authContext";
import { ArrowLeft, Puzzle, Flame, Calendar, Trophy, Target } from "lucide-react";
import api from "../utils/api";

const DailyPuzzlesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayPuzzle, setTodayPuzzle] = useState(null);
  const [streak, setStreak] = useState({ current: 7, longest: 12 });
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyPuzzle();
    fetchStreak();
    generateCalendar();
  }, []);

  const fetchDailyPuzzle = async () => {
    // TODO: Replace with real API call when backend endpoint is ready
    // GET /puzzles/daily
    try {
      setLoading(true);
      
      // For now, try to get puzzles and filter for daily, or use mock data
      try {
        const res = await api.get("/puzzles");
        // If backend supports daily puzzles, filter them
        // For now, use first puzzle as today's puzzle
        if (res.data && res.data.length > 0) {
          const puzzle = res.data[0];
          setTodayPuzzle({
            ...puzzle,
            date: new Date().toISOString().split('T')[0],
            completed: puzzle.solved || false
          });
        } else {
          // Mock data if no puzzles available
          setTodayPuzzle({
            puzzle_id: "daily-001",
            difficulty: "medium",
            objective: "Create an equation that equals 15",
            date: new Date().toISOString().split('T')[0],
            completed: false
          });
        }
      } catch (err) {
        // Fallback to mock data
        setTodayPuzzle({
          puzzle_id: "daily-001",
          difficulty: "medium",
          objective: "Create an equation that equals 15",
          date: new Date().toISOString().split('T')[0],
          completed: false
        });
      }
    } catch (error) {
      console.error("Failed to fetch daily puzzle:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    // TODO: Replace with real API call when backend endpoint is ready
    // GET /puzzles/streak
    try {
      // Mock streak data
      setStreak({
        current: 7,
        longest: 12,
        lastCompleted: "2025-11-13"
      });
    } catch (error) {
      console.error("Failed to fetch streak:", error);
    }
  };

  const generateCalendar = () => {
    // Generate last 30 days calendar
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Mock: mark some days as completed
      const completed = Math.random() > 0.3 && i < streak.current;
      
      days.push({
        date: dateStr,
        completed,
        isToday: i === 0
      });
    }
    
    setCalendarData(days);
  };

  const handlePlayPuzzle = () => {
    if (todayPuzzle) {
      navigate(`/puzzle/${todayPuzzle.puzzle_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-slate-300">Loading daily puzzle...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/puzzles")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Puzzles
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Puzzle className="w-8 h-8" />
            Daily Puzzles
          </h1>
          <div className="w-32"></div>
        </div>

        {/* Streak Display */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 ring-1 ring-orange-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Flame className="w-8 h-8 text-orange-400" />
                <h2 className="text-3xl font-bold text-white">
                  {streak.current} Day Streak
                </h2>
              </div>
              <p className="text-slate-300">
                Longest streak: {streak.longest} days
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm mb-1">Keep it going!</p>
              {streak.current > 0 && (
                <p className="text-orange-400 font-semibold">
                  🔥 {streak.current} days in a row
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Today's Puzzle */}
        {todayPuzzle && (
          <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Today's Puzzle</h2>
                <p className="text-slate-400">
                  {new Date(todayPuzzle.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              {todayPuzzle.completed && (
                <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Completed
                </div>
              )}
            </div>

            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">Objective:</span>
                  <span className="text-slate-300">{todayPuzzle.objective}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  todayPuzzle.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                  todayPuzzle.difficulty === 'hard' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {todayPuzzle.difficulty}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlayPuzzle}
              disabled={todayPuzzle.completed}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                todayPuzzle.completed
                  ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
              }`}
            >
              <Puzzle className="w-6 h-6" />
              {todayPuzzle.completed ? "Already Completed" : "Play Today's Puzzle"}
            </button>
          </div>
        )}

        {/* Calendar View */}
        <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Puzzle Calendar
          </h2>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Day labels */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarData.map((day, idx) => {
              const date = new Date(day.date);
              const dayNum = date.getDate();
              const isToday = day.isToday;
              
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                    isToday
                      ? 'ring-2 ring-indigo-500 bg-indigo-500/20 text-indigo-400'
                      : day.completed
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                  }`}
                  title={day.date}
                >
                  {day.completed ? (
                    <Trophy className="w-5 h-5" />
                  ) : (
                    dayNum
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500/20 rounded border border-green-500/30"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-indigo-500/20 rounded border-2 border-indigo-500"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPuzzlesPage;

