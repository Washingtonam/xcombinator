import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  // 🔥 AUTO REDIRECT IF LOGGED IN
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-6">

      {/* LOGO / TITLE */}
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        Xcombinator
      </h1>

      <p className="text-gray-500 mb-8 text-center max-w-md">
        Fast, secure NIN verification & identity services for businesses and individuals.
      </p>

      {/* CTA BUTTONS */}
      <div className="flex gap-4">

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Login
        </button>

        <button
          onClick={() => navigate("/register")}
          className="px-6 py-3 border border-black rounded-lg"
        >
          Register
        </button>

      </div>

      {/* TRUST TEXT */}
      <p className="text-xs text-gray-400 mt-10 text-center">
        Trusted by agents and businesses for identity verification
      </p>

    </div>
  );
}