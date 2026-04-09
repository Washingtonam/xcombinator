import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) navigate("/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* NAVBAR */}
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h1 className="font-bold text-lg">Xcombinator</h1>

        <div className="flex gap-3">
          <button onClick={() => navigate("/login")} className="text-sm">
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
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Verify NIN Instantly & Securely
        </h1>

        <p className="text-gray-500 max-w-lg mb-6">
          Built for agents, businesses, and professionals who need fast,
          reliable identity verification without delays.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/register")}
            className="bg-black text-white px-6 py-3 rounded-lg"
          >
            Create Account
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border px-6 py-3 rounded-lg"
          >
            Login
          </button>
        </div>

        {/* TRUST */}
        <p className="text-xs text-gray-400 mt-6">
          ⚡ Fast • 🔒 Secure • 💼 Built for Professionals
        </p>

      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-3 gap-6 px-6 py-10 bg-gray-50">

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">NIN Validation</h3>
          <p className="text-sm text-gray-500">
            Validate identity records instantly with high accuracy.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">IPE Clearance</h3>
          <p className="text-sm text-gray-500">
            Fix processing issues and unlock stuck NIN records.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <h3 className="font-semibold mb-2">Modifications</h3>
          <p className="text-sm text-gray-500">
            Handle corrections and updates professionally.
          </p>
        </div>

      </div>

    </div>
  );
}