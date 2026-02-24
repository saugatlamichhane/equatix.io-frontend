# Equatix.io

Equatix.io is a real-time, multiplayer math-based strategy game where players compete to solve mathematical puzzles and outmaneuver opponents. The project features a high-performance C++ backend and a modern React frontend to deliver a low-latency gaming experience.

---

## 🚀 Key Features

- **Real-Time Multiplayer**  
  Low-latency matches against other players using WebSockets.

- **Daily Puzzles**  
  Challenges that refresh daily to keep players engaged without requiring a login.

- **Global Leaderboard**  
  Track top-performing players globally with special highlighting for your own rank.

- **Social Integration**  
  Find players and add friends to build a competitive community.

- **Guest Access**  
  Explore the dashboard, leaderboard, puzzles, and feedback system without needing to sign in.

- **Secure Authentication**  
  Firebase-powered authentication for progress saving and profile management.

---

## 🛠️ Technical Stack

### Frontend
- **React.js** – Functional components and Hooks for a responsive UI  
- **Tailwind CSS** – Utility-first styling for a sleek dark-themed interface  
- **Socket.io-client** – Real-time bidirectional communication  
- **Vite** – Ultra-fast frontend tooling and bundling  

### Backend
- **C++ (Drogon Framework)** – High-performance, non-blocking HTTP/WebSocket framework for game logic and APIs  
- **PostgreSQL** – Reliable data storage for user profiles and leaderboard stats  
- **Firebase Auth** – Secure token-based authentication  

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)  
- npm or yarn  

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/equatix-io.git
cd equatix-io
```

---

### 2️⃣ Environment Setup

Create a `.env` file in the root directory and add your configuration  
(see `.env.example` for the required keys):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=equatix-io.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=equatix-io
VITE_FIREBASE_STORAGE_BUCKET=equatix-io.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=https://your-backend-api.com
VITE_SOCKET_URL=wss://your-backend-socket.com
```

---

### 3️⃣ Install Dependencies

```bash
npm install
```

---

### 4️⃣ Run the Development Server

```bash
npm run dev
```

---

## 🛡️ Security Note

This repository has been sanitized for public release.  
All sensitive API keys and backend URLs have been moved to environment variables.  

⚠️ Never commit your actual `.env` file to version control.

---

## 📜 License

Distributed under the MIT License.

---

**Developed by Saugat Lamichhane**