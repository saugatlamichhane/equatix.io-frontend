import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Lightbulb, Brain, Play, Video, Trophy, Clock, ArrowLeft } from "lucide-react";

const lessons = {
  basics: [
    { id: "b1", title: "Rules of Equatix", duration: "5 min", level: "Beginner" },
    { id: "b2", title: "Tiles, Bag, and Rack", duration: "6 min", level: "Beginner" },
    { id: "b3", title: "Making Valid Equations", duration: "7 min", level: "Beginner" },
  ],
  strategy: [
    { id: "s1", title: "Board Control Fundamentals", duration: "8 min", level: "Intermediate" },
    { id: "s2", title: "Maximizing Score Multipliers", duration: "9 min", level: "Intermediate" },
    { id: "s3", title: "Probability and Bag Tracking", duration: "10 min", level: "Advanced" },
  ],
  practice: [
    { id: "p1", title: "Make 24 Challenge", duration: "10 problems", level: "All" },
    { id: "p2", title: "Equation Completion", duration: "15 problems", level: "All" },
    { id: "p3", title: "Speed Math Trainer", duration: "3 min", level: "All" },
  ],
};

const LearnPage = () => {
  const [tab, setTab] = useState("basics");
  const navigate = useNavigate();

  const items = useMemo(() => lessons[tab] || [], [tab]);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              Learn
            </h1>
            <p className="text-slate-300">Tutorials, strategies, and practice to improve your game</p>
          </div>
          <button
            onClick={() => navigate("/botgame")}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Play className="w-5 h-5" /> Practice vs Bot
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800/50 rounded-xl p-2 ring-1 ring-white/10 mb-6 inline-flex">
          {[
            { k: "basics", label: "Basics", icon: <Lightbulb className="w-4 h-4 mr-2" /> },
            { k: "strategy", label: "Strategy", icon: <Brain className="w-4 h-4 mr-2" /> },
            { k: "practice", label: "Practice", icon: <Trophy className="w-4 h-4 mr-2" /> },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                tab === t.k ? "bg-slate-700 text-white" : "text-slate-300 hover:text-white"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lessons grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((l) => (
              <div key={l.id} className="bg-slate-800/50 rounded-xl p-5 ring-1 ring-white/10 hover:bg-slate-800/70 transition-colors">
                <h3 className="text-white font-semibold mb-1">{l.title}</h3>
                <div className="flex items-center gap-4 text-slate-400 text-sm mb-4">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {l.duration}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Video className="w-4 h-4" /> {l.level}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">Start</button>
                  {tab === "practice" && (
                    <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">Try Sample</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Featured video / tips */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Video className="w-5 h-5" /> Featured Lesson
              </h2>
              <div className="aspect-video w-full rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
                Coming soon: video walkthroughs
              </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10">
              <h2 className="text-white font-semibold mb-3">Tips</h2>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Prioritize high-value equations early to gain momentum.</li>
                <li>Track remaining tiles mentally to plan future moves.</li>
                <li>Control central areas to maximize multiplier access.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
