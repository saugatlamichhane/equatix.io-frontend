import { useState } from "react";
import axios from "axios";
import { auth } from "../firebase";

const FeedbackForm = () => {
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
    <form
      onSubmit={submitFeedback}
      className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow"
    >
      <h2 className="text-xl font-semibold mb-4">Send Feedback</h2>

      <textarea
        className="w-full border p-2 mb-2 rounded"
        rows={4}
        placeholder="Your feedback..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <label className="block mb-2">
        Rating:
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="ml-2 p-1 border rounded"
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
        className="bg-amber-900 text-white px-4 py-2 rounded w-full"
      >
        Submit
      </button>

      {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
    </form>
  );
};

export default FeedbackForm;
