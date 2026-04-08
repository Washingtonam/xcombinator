import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, units } = useUser(); // 🔥 SWITCHED TO UNITS

  return (
    <div className="max-w-6xl mx-auto">

      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Welcome, {user?.email}
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your verifications and usage from here
        </p>
      </div>

      {/* ========================= */}
      {/* UNITS CARD (REPLACES WALLET) */}
      {/* ========================= */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6 rounded-2xl mb-8 shadow-lg">
        <p className="text-sm opacity-80">Available Units</p>

        <h2 className="text-4xl font-bold mt-1">
          {units}
        </h2>

        <p className="text-xs mt-2 opacity-80">
          1 Unit = 1 Verification
        </p>

        <div className="mt-4 flex gap-3 flex-wrap">

          <button
            onClick={() => navigate("/wallet")}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Buy Units
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            View Usage
          </button>

        </div>
      </div>

      {/* ========================= */}
      {/* QUICK ACTIONS */}
      {/* ========================= */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

        {/* VERIFY NIN */}
        <div
          onClick={() => navigate("/verify-nin")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-100 dark:border-gray-800"
        >
          <p className="text-2xl mb-2">🆔</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Verify NIN
          </h3>
          <p className="text-sm text-gray-500">
            Check NIN details instantly
          </p>
        </div>

        {/* VERIFY BVN */}
        <div
          onClick={() => navigate("/verify-bvn")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-100 dark:border-gray-800"
        >
          <p className="text-2xl mb-2">🏦</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Verify BVN
          </h3>
          <p className="text-sm text-gray-500">
            Verify BVN records
          </p>
        </div>

        {/* BUY UNITS (REPLACED WALLET) */}
        <div
          onClick={() => navigate("/wallet")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-100 dark:border-gray-800"
        >
          <p className="text-2xl mb-2">⚡</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Buy Units
          </h3>
          <p className="text-sm text-gray-500">
            Fund account for verifications
          </p>
        </div>

        {/* TRANSACTIONS */}
        <div
          onClick={() => navigate("/transactions")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border border-gray-100 dark:border-gray-800"
        >
          <p className="text-2xl mb-2">📜</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Transactions
          </h3>
          <p className="text-sm text-gray-500">
            View your usage history
          </p>
        </div>

      </div>

      {/* ========================= */}
      {/* TRUST SECTION */}
      {/* ========================= */}
      <div className="mt-10 p-5 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow border border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          🔐 Secure & Verified Platform
        </h3>

        <p className="text-sm text-gray-500">
          All verifications are processed securely. Ensure you have proper consent before verifying any identity.
        </p>
      </div>

    </div>
  );
}