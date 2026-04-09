import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white/70 backdrop-blur">
        <h1 className="font-bold text-lg text-gray-900">Xcombinator</h1>

        <div className="flex gap-3">
          <button onClick={() => navigate("/login")} className="text-sm text-gray-600">
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* HERO */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6 relative">

        {/* subtle background pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle,_#000_1px,_transparent_1px)] [background-size:20px_20px]" />

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative z-10">
          Verify NIN Instantly & Securely
        </h1>

        <p className="text-gray-600 max-w-lg mb-6 relative z-10">
          Built for agents, businesses, and professionals who need fast,
          reliable identity verification without delays.
        </p>

        <div className="flex gap-4 relative z-10">
          <button
            onClick={() => navigate("/register")}
            className="bg-black text-white px-6 py-3 rounded-lg shadow hover:scale-105 transition"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Login
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-6 relative z-10">
          ⚡ Fast • 🔒 Secure • 💼 Built for Professionals
        </p>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-6 px-6 py-10 bg-white">

        <div className="p-5 rounded-xl border hover:shadow-lg transition">
          <h3 className="font-semibold mb-2">NIN Validation</h3>
          <p className="text-sm text-gray-500">
            Validate identity records instantly with high accuracy.
          </p>
        </div>

        <div className="p-5 rounded-xl border hover:shadow-lg transition">
          <h3 className="font-semibold mb-2">IPE Clearance</h3>
          <p className="text-sm text-gray-500">
            Fix processing issues and unlock stuck NIN records.
          </p>
        </div>

        <div className="p-5 rounded-xl border hover:shadow-lg transition">
          <h3 className="font-semibold mb-2">Modifications</h3>
          <p className="text-sm text-gray-500">
            Handle corrections and updates professionally.
          </p>
        </div>

      </div>

    </div>
  );
}