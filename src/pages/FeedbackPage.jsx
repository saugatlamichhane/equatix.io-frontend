import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";

const FeedbackPage = () => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [status, setStatus] = useState("");

  const submitFeedback = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const uid = auth.currentUser?.uid;
      await axios.post(
        "https://equatix-io-backend.onrender.com/api/feedback",
        {
          uid,
          message,
          rating,
        }
      );

      setStatus("✅ Feedback submitted!");
      setMessage("");
      setRating(5);
    } catch (err) {
      setStatus("❌ Failed to send feedback.");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        <form
          onSubmit={submitFeedback}
          className="bg-slate-800/50 rounded-xl p-6 ring-1 ring-white/10"
        >
          <h2 className="text-2xl font-semibold mb-6 text-white">Send Feedback</h2>

          <textarea
            className="w-full bg-slate-700 text-slate-100 placeholder:text-slate-400 border border-slate-600 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Your feedback..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <label className="block mb-4 text-slate-200">
            Rating:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="ml-2 bg-slate-700 text-slate-100 border border-slate-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg w-full hover:bg-indigo-600 transition-colors font-medium"
          >
            Submit
          </button>

          {status && <p className="mt-4 text-sm text-slate-300">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default FeedbackPage;
