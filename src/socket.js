import { io } from "socket.io-client";

// adjust URL / port to your Node server
export const socket = io("https://equatix-io-backend.onrender.com", {
  transports: ["websocket"],
  withCredentials: true,
});
