import React from "react";
import { Instagram, Facebook, ArrowLeft } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

<FaDiscord size={24} />;

import { useNavigate } from "react-router-dom";

const SocialsPage = () => {
  const navigate = useNavigate();

  const socials = [
    // {
    //   name: "Instagram",
    //   icon: <Instagram size={18} />,
    //   url: "https://www.instagram.com/yourprofile", // ⬅️ Replace with your real link
    //   color: "bg-pink-500 hover:bg-pink-600",
    // },
    {
      name: "Facebook",
      icon: <Facebook size={18} />,
      url: "https://www.facebook.com/profile.php?id=61579996730348", // ⬅️ Replace with your real link
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Discord",
      icon: <FaDiscord size={18} />,
      url: "https://discord.gg/SNSxFKwAG5", // ⬅️ Replace with your real invite
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Connect with us on Socials
        </h2>

        <div className="flex flex-col gap-3 mb-4">
          {socials.map((s, index) => (
            <a
              key={index}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between text-white px-4 py-2 rounded-lg transition ${s.color}`}
            >
              <span>{s.name}</span>
              {s.icon}
            </a>
          ))}
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default SocialsPage;
