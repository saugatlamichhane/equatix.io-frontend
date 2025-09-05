import React, { useState, useEffect, useRef } from "react";

const BOARD_SIZE = 15;
const RACK_SIZE = 8;

// Example bag (numbers + operators)
const INITIAL_BAG = [
  ..."0123456789".split(""),
  ..."+-*/".split(""),
];

const BotGamePage = () => {
  const [bag, setBag] = useState(INITIAL_BAG);
  const [rack, setRack] = useState(Array(RACK_SIZE).fill(null));
  const [board, setBoard] = useState(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );

  const wsRef = useRef(null);

  const handleDragStart = (e, tile, rackIndex) => {
    e.dataTransfer.setData("tile", tile);
    e.dataTransfer.setData("rackIndex", rackIndex);
  };

  const handleDrop = (e, row, col) => {
    e.preventDefault();
    const tile = e.dataTransfer.getData("tile");
    const rackIndex = e.dataTransfer.getData("rackIndex");
    if (!tile) return;

    // Update board
    setBoard((prev) => {
      if (prev[row][col] !== null) return prev;
      const newBoard = prev.map((r) => [...r]);
      newBoard[row][col] = tile;
      return newBoard;
    });

    // Update rack
    setRack((prev) => {
      const newRack = [...prev];
      newRack[rackIndex] = null;
      return newRack;
    });

    // Send placement message to backend
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const message = {
        type: "placement",
        payload: {
          row: row,
          col: col,
          value: tile,
        },
      };
      wsRef.current.send(JSON.stringify(message));
      console.log("Sent to server:", message);
    }
  };

  const allowDrop = (e) => e.preventDefault();

  // WebSocket connection
  useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:5555/echo?room_name=room3");

    wsRef.current.onopen = () => console.log("WebSocket connected");

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Message from server:", data);

        // If it's an init message, update rack
        if (data.type === "init" && Array.isArray(data.rack)) {
          setRack(data.rack);
        }
      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    wsRef.current.onclose = () => console.log("WebSocket disconnected");
    wsRef.current.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Equatix Math Scrabble</h1>

      {/* Board */}
      <div className="grid grid-cols-15 gap-0.5 bg-gray-400 p-1">
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              onDrop={(e) => handleDrop(e, rIdx, cIdx)}
              onDragOver={allowDrop}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 text-lg font-bold"
            >
              {cell}
            </div>
          ))
        )}
      </div>

      {/* Rack */}
      <div className="flex mt-6 space-x-2">
        {rack.map((tile, idx) => (
          <div
            key={idx}
            draggable={!!tile}
            onDragStart={(e) => handleDragStart(e, tile, idx)}
            className={`w-12 h-12 flex items-center justify-center border rounded bg-yellow-200 text-xl font-bold shadow-md ${
              tile ? "cursor-move" : "bg-gray-200"
            }`}
          >
            {tile}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BotGamePage;
