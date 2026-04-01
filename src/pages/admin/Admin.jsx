import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://xcombinator.onrender.com";

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH DATA
  // =========================
  const fetchData = async () => {
    try {
      const [usersRes, txRes, payRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/users`, { headers }),
        axios.get(`${API_BASE}/api/admin/transactions`, { headers }),
        axios.get(`${API_BASE}/api/admin/payments`, { headers }),
      ]);

      setUsers(usersRes.data);
      setTransactions(txRes.data);
      setPayments(payRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =========================
  // CALCULATIONS
  // =========================
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  const pendingPayments = payments.filter(
    (p) => p.status === "pending"
  ).length;

  // =========================
  // UI
  // =========================
  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Users</p>
          <h2 className="text-xl font-bold">{users.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Balance</p>
          <h2 className="text-xl font-bold">₦{totalBalance}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Transactions</p>
          <h2 className="text-xl font-bold">{transactions.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Pending Payments</p>
          <h2 className="text-xl font-bold text-red-600">
            {pendingPayments}
          </h2>
        </div>

      </div>

      {/* ========================= */}
      {/* QUICK ACTION CARDS */}
      {/* ========================= */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* USERS */}
        <div
          onClick={() => navigate("/admin/users")}
          className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold mb-2">👥 Manage Users</h2>
          <p className="text-sm text-gray-500">
            View users, suspend, delete, fund wallets
          </p>
        </div>

        {/* PAYMENTS */}
        <div
          onClick={() => navigate("/admin/payments")}
          className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition relative"
        >
          <h2 className="text-lg font-bold mb-2">💳 Payment Requests</h2>
          <p className="text-sm text-gray-500">
            Approve or reject manual payments
          </p>

          {pendingPayments > 0 && (
            <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
              {pendingPayments}
            </span>
          )}
        </div>

        {/* 🔥 NEW: PRICING */}
        <div
          onClick={() => navigate("/admin/pricing")}
          className="bg-white p-6 rounded shadow cursor-pointer hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold mb-2">💰 Pricing Control</h2>
          <p className="text-sm text-gray-500">
            Update NIN & BVN verification prices
          </p>
        </div>

      </div>

      {/* ========================= */}
      {/* ALERT */}
      {/* ========================= */}
      {pendingPayments > 0 && (
        <div className="bg-red-100 border border-red-300 p-4 rounded">

          <p className="text-red-700 font-medium">
            ⚠️ You have {pendingPayments} pending payment request(s)
          </p>

          <button
            onClick={() => navigate("/admin/payments")}
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
          >
            Review Payments
          </button>

        </div>
      )}

    </div>
  );
}