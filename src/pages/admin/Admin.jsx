import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function Admin() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalTransactions: 0,
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/stats`, {
        headers: {
          email: localStorage.getItem("email"),
        },
      });

      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Revenue</h2>
          <p className="text-xl font-bold text-green-600">
            ₦{stats.totalRevenue}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Cost</h2>
          <p className="text-xl font-bold text-red-500">
            ₦{stats.totalCost}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Profit</h2>
          <p className="text-xl font-bold text-blue-600">
            ₦{stats.totalProfit}
          </p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-sm text-gray-500">Transactions</h2>
          <p className="text-xl font-bold">
            {stats.totalTransactions}
          </p>
        </div>

      </div>
    </div>
  );
}