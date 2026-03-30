import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/users`, { headers });
    setUsers(res.data);
  };

  // =========================
  // SEARCH USERS
  // =========================
  const handleSearch = async () => {
    if (!search) return fetchUsers();

    const res = await axios.get(
      `${API_BASE}/api/admin/users/search?query=${search}`,
      { headers }
    );

    setUsers(res.data);
  };

  // =========================
  // USER ACTIVITY
  // =========================
  const fetchUserActivity = async (id) => {
    const res = await axios.get(
      `${API_BASE}/api/admin/user/${id}`,
      { headers }
    );

    setSelectedUser(res.data.user);
    setUserActivity(res.data.transactions);
  };

  // =========================
  // ACTIONS
  // =========================
  const suspendUser = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/suspend`, {}, { headers });
    fetchUsers();
  };

  const activateUser = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/activate`, {}, { headers });
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(`${API_BASE}/api/admin/user/${id}`, { headers });
    fetchUsers();
  };

  const addMoney = async (id) => {
    const amount = prompt("Enter amount to ADD:");
    if (!amount) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/wallet`,
      { amount: Number(amount), action: "add" },
      { headers }
    );

    fetchUsers();
  };

  const deductMoney = async (id) => {
    const amount = prompt("Enter amount to DEDUCT:");
    if (!amount) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/wallet`,
      { amount: Number(amount), action: "deduct" },
      { headers }
    );

    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-6">User Management</h1>

      {/* ================= SEARCH ================= */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by email or name..."
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

      {/* ================= USERS TABLE ================= */}
      <div className="bg-white p-6 rounded shadow mb-10 overflow-x-auto">

        <table className="w-full text-sm">

          <thead>
            <tr className="text-left border-b">
              <th>Email</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t">

                {/* CLICK TO VIEW ACTIVITY */}
                <td
                  className="cursor-pointer text-blue-600"
                  onClick={() => fetchUserActivity(u._id)}
                >
                  {u.email}
                </td>

                <td>₦{u.balance}</td>

                <td>
                  <span
                    className={`px-2 py-1 text-white text-xs rounded ${
                      u.status === "active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>

                <td className="space-x-2">

                  {/* 🚫 PROTECT ADMIN */}
                  {u.email !== "washingtonamedu@gmail.com" && (
                    <>
                      {u.status === "active" ? (
                        <button
                          onClick={() => suspendUser(u._id)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser(u._id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Activate
                        </button>
                      )}

                      <button
                        onClick={() => deleteUser(u._id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => addMoney(u._id)}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        +₦
                      </button>

                      <button
                        onClick={() => deductMoney(u._id)}
                        className="bg-gray-800 text-white px-2 py-1 rounded text-xs"
                      >
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

      {/* ================= USER ACTIVITY ================= */}
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