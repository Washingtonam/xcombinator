import { useEffect, useState } from "react";
import axios from "axios";
import AdminPricing from "./AdminPricing";

const API_BASE = "https://xcombinator.onrender.com";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]); // ✅ NEW
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [search, setSearch] = useState("");

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH DATA
  // =========================
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

  // =========================
  // 🔥 FETCH PAYMENT REQUESTS
  // =========================
  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/payments`, { headers });
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SEARCH USERS
  // =========================
  const handleSearch = async () => {
    if (!search) return fetchData();

    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/users/search?query=${search}`,
        { headers }
      );

      setUsers(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // USER ACTIVITY
  // =========================
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

  // =========================
  // USER ACTIONS
  // =========================
  const suspendUser = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/suspend`, {}, { headers });
    fetchData();
  };

  const activateUser = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/activate`, {}, { headers });
    fetchData();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(`${API_BASE}/api/admin/user/${id}`, { headers });
    fetchData();
  };

  const addMoney = async (id) => {
    const amount = prompt("Enter amount to ADD:");
    if (!amount) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/wallet`,
      { amount: Number(amount), action: "add" },
      { headers }
    );

    fetchData();
  };

  const deductMoney = async (id) => {
    const amount = prompt("Enter amount to DEDUCT:");
    if (!amount) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/wallet`,
      { amount: Number(amount), action: "deduct" },
      { headers }
    );

    fetchData();
  };

  // =========================
  // 💳 PAYMENT ACTIONS
  // =========================
  const approvePayment = async (id) => {
    await axios.post(`${API_BASE}/api/admin/payments/${id}/approve`, {}, { headers });
    fetchPayments();
    fetchData();
  };

  const rejectPayment = async (id) => {
    await axios.post(`${API_BASE}/api/admin/payments/${id}/reject`, {}, { headers });
    fetchPayments();
  };

  useEffect(() => {
    fetchData();
    fetchPayments(); // ✅ NEW
  }, []);

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}
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

      {/* ========================= */}
      {/* PRICING */}
      {/* ========================= */}
      <div className="mb-10">
        <AdminPricing />
      </div>

      {/* ========================= */}
      {/* SEARCH */}
      {/* ========================= */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Search
        </button>
      </div>

      {/* ========================= */}
      {/* USERS TABLE */}
      {/* ========================= */}
      <div className="bg-white p-6 rounded shadow mb-10">

        <h2 className="mb-4 font-bold">Users</h2>

        <table className="w-full text-sm">

          <thead>
            <tr>
              <th>Email</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t">

                <td
                  className="cursor-pointer text-blue-600"
                  onClick={() => fetchUserActivity(u._id)}
                >
                  {u.email}
                </td>

                <td>₦{u.balance}</td>

                <td>
                  <span className={`px-2 py-1 text-white text-xs rounded ${
                    u.status === "active" ? "bg-green-500" : "bg-red-500"
                  }`}>
                    {u.status}
                  </span>
                </td>

                <td className="space-x-2">

                  {u.email !== "washingtonamedu@gmail.com" && (
                    <>
                      {u.status === "active" ? (
                        <button onClick={() => suspendUser(u._id)} className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          Suspend
                        </button>
                      ) : (
                        <button onClick={() => activateUser(u._id)} className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          Activate
                        </button>
                      )}

                      <button onClick={() => deleteUser(u._id)} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        Delete
                      </button>

                      <button onClick={() => addMoney(u._id)} className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                        +₦
                      </button>

                      <button onClick={() => deductMoney(u._id)} className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
                        -₦
                      </button>
                    </>
                  )}

                </td>

              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* ========================= */}
      {/* 💳 PAYMENT APPROVAL PANEL */}
      {/* ========================= */}
      <div className="bg-white p-6 rounded shadow mb-10">

        <h2 className="font-bold mb-4">Payment Requests</h2>

        {payments.length === 0 && <p>No pending payments</p>}

        {payments.map(p => (
          <div key={p._id} className="border p-4 mb-4 rounded">

            <p><b>User:</b> {p.userId?.email}</p>
            <p><b>Amount:</b> ₦{p.amount}</p>
            <p><b>Status:</b> {p.status}</p>

            <img src={p.proof} className="w-40 mt-2" />

            {p.status === "pending" && (
              <div className="mt-2 space-x-2">

                <button
                  onClick={() => approvePayment(p._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectPayment(p._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Reject
                </button>

              </div>
            )}

          </div>
        ))}

      </div>

      {/* ========================= */}
      {/* USER ACTIVITY */}
      {/* ========================= */}
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
                <tr key={tx._id}>
                  <td>{tx.type}</td>
                  <td>₦{tx.amount}</td>
                  <td>{tx.status}</td>
                  <td>{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}