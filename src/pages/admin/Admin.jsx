import { useEffect, useState } from "react";
import axios from "axios";
import AdminPricing from "./AdminPricing";

const API_BASE = "https://xcombinator.onrender.com";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCost: 0,
    totalProfit: 0,
    totalTransactions: 0,
  });

  const fetchData = async () => {
    try {
      const [usersRes, txRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/users`),
        axios.get(`${API_BASE}/admin/transactions`),
        axios.get(`${API_BASE}/api/admin/stats`, {
          headers: { email: localStorage.getItem("email") },
        }),
      ]);

      setUsers(usersRes.data);
      setTransactions(txRes.data);
      setStats(statsRes.data);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* 🔝 STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-4 rounded shadow">
          <p>Total Users</p>
          <h2>{users.length}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Balance</p>
          <h2>₦{totalBalance}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Transactions</p>
          <h2>{stats.totalTransactions}</h2>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p>Total Profit</p>
          <h2 className="text-green-600">₦{stats.totalProfit}</h2>
        </div>

      </div>

      {/* 🔥 PRICING CONTROL */}
      <div className="mb-10">
        <AdminPricing />
      </div>

      {/* 👥 USERS */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="mb-4 font-bold">Users</h2>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>₦{u.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📜 TRANSACTIONS */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="mb-4 font-bold">Transactions</h2>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Cost</th>
              <th>Profit</th>
              <th>User</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id}>
                <td>{tx.type}</td>
                <td>₦{tx.amount}</td>
                <td>₦{tx.cost || 0}</td>
                <td>₦{tx.profit || 0}</td>
                <td>{tx.userId}</td>
                <td>{new Date(tx.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}