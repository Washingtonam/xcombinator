import { useEffect, useState } from "react";
import axios from "axios";
import AdminPricing from "./AdminPricing";

const API_BASE = "https://xcombinator.onrender.com";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);

  const headers = {
    email: localStorage.getItem("email"),
  };

  const fetchData = async () => {
    try {
      const [usersRes, txRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/users`, { headers }),
        axios.get(`${API_BASE}/api/admin/transactions`, { headers }),
      ]);

      setUsers(usersRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserActivity = async (userId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/user/${userId}`,
        { headers }
      );

      setSelectedUser(res.data.user);
      setUserActivity(res.data.transactions);

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

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
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
          <h2>{transactions.length}</h2>
        </div>
      </div>

      {/* PRICING */}
      <div className="mb-10">
        <AdminPricing />
      </div>

      {/* USERS */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="mb-4 font-bold">Users (Click to view activity)</h2>

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
              <tr
                key={u.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => fetchUserActivity(u.id)}
              >
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>₦{u.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USER ACTIVITY */}
      {selectedUser && (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="font-bold mb-4">
            Activity for {selectedUser.email}
          </h2>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {userActivity.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.type}</td>
                  <td>₦{tx.amount}</td>
                  <td>{tx.status}</td>
                  <td>{new Date(tx.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}