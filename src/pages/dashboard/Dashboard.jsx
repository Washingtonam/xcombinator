import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://xcombinator.onrender.com";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, units, refreshUnits } = useUser();

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const [recent, setRecent] = useState([]);

  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    if (user?.id) {
      refreshUnits();
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/api/user/requests/${user.id}`);

      const data = res.data || [];

      setRecent(data.slice(0, 4));

      setStats({
        total: data.length,
        completed: data.filter(r => r.status === "completed").length,
        pending: data.filter(r => r.status === "pending").length,
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
          Welcome back 👋
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here’s what’s happening with your account
        </p>
      </div>

      {/* =========================
          🔥 MAIN CARD
      ========================= */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 text-white p-6 rounded-2xl mb-8 shadow-lg">

        <div className="flex justify-between items-center">

          <div>
            <p className="text-sm opacity-80">Available Units</p>
            <h2 className="text-4xl font-bold">{units}</h2>
          </div>

          <div className="text-right text-sm">
            <p>Total Requests: <b>{stats.total}</b></p>
            <p>Completed: <b>{stats.completed}</b></p>
            <p>Pending: <b>{stats.pending}</b></p>
          </div>

        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/wallet")}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Buy Units
          </button>

          <button
            onClick={() => navigate("/my-requests")}
            className="bg-white/20 px-4 py-2 rounded-lg text-sm font-semibold"
          >
            View Requests
          </button>
        </div>
      </div>

      {/* =========================
          🔥 QUICK ACTIONS
      ========================= */}
      <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">

        {/* VERIFY NIN */}
        <div
          onClick={() => navigate("/verify-nin")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border"
        >
          <p className="text-2xl mb-2">🆔</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Verify NIN
          </h3>
        </div>

        {/* 🔥 NIN SERVICES (REPLACED BVN) */}
        <div
          onClick={() => navigate("/nin-services")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border"
        >
          <p className="text-2xl mb-2">🏦</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            NIN Services
          </h3>
        </div>

        {/* MY REQUESTS */}
        <div
          onClick={() => navigate("/my-requests")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border"
        >
          <p className="text-2xl mb-2">📦</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            My Requests
          </h3>
        </div>

        {/* TRANSACTIONS */}
        <div
          onClick={() => navigate("/transactions")}
          className="bg-white dark:bg-[#1A1A1A] p-5 rounded-2xl shadow hover:shadow-xl transition cursor-pointer border"
        >
          <p className="text-2xl mb-2">📜</p>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            Transactions
          </h3>
        </div>

      </div>

      {/* =========================
          🔥 RECENT ACTIVITY
      ========================= */}
      <div className="mt-10">

        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Recent Activity
        </h2>

        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow border p-4">

          {recent.length === 0 && (
            <p className="text-gray-500 text-sm">
              No activity yet
            </p>
          )}

          <div className="space-y-3">

            {recent.map((r) => (
              <div
                key={r._id}
                className="flex justify-between items-center border-b pb-2 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {r.service} - {r.type}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>

                <span className={`px-2 py-1 rounded text-xs ${
                  r.status === "completed"
                    ? "bg-blue-100 text-blue-700"
                    : r.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : r.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {r.status}
                </span>
              </div>
            ))}

          </div>

        </div>

      </div>

      {/* TRUST */}
      <div className="mt-10 p-5 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow border">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          🔐 Secure & Trusted Platform
        </h3>

        <p className="text-sm text-gray-500">
          Your requests are processed securely with real-time updates and full transparency.
        </p>
      </div>

    </div>
  );
}