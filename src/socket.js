import { io } from "socket.io-client";

// adjust URL / port to your Node server
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
  withCredentials: true,
});
