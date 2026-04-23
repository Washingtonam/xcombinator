import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUserEmail = localStorage.getItem("email");

  const headers = {
    email: currentUserEmail,
  };

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/users`, { headers });
      const data = res.data?.data || res.data || [];
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // =========================
  // SEARCH
  // =========================
  const handleSearch = async () => {
    if (!search) return fetchUsers();

    const res = await axios.get(
      `${API_BASE}/api/admin/users?search=${search}`,
      { headers }
    );

    setUsers(res.data?.data || []);
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
  // ROLE CONTROL (SUPER ADMIN)
  // =========================
  const makeAdmin = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/make-admin`, {}, { headers });
    fetchUsers();
  };

  const removeAdmin = async (id) => {
    await axios.put(`${API_BASE}/api/admin/user/${id}/remove-admin`, {}, { headers });
    fetchUsers();
  };

  // =========================
  // BASIC ACTIONS
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

  const addUnits = async (id) => {
    const units = prompt("Units to add:");
    if (!units) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/units`,
      { units: Number(units), action: "add" },
      { headers }
    );

    fetchUsers();
  };

  const deductUnits = async (id) => {
    const units = prompt("Units to deduct:");
    if (!units) return;

    await axios.post(
      `${API_BASE}/api/admin/user/${id}/units`,
      { units: Number(units), action: "deduct" },
      { headers }
    );

    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isSuperAdmin = currentUserEmail === "washingtonamedu@gmail.com";

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">User Management</h1>
      <p className="text-gray-500 mb-6">
        Control users, roles, and system access
      </p>

      {/* SEARCH */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-3 w-full rounded-lg"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 rounded-lg"
        >
          Search
        </button>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading users...
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {users.map((u) => (
          <div
            key={u._id}
            className="bg-white p-5 rounded-2xl shadow border hover:shadow-lg transition"
          >

            {/* TOP */}
            <div className="flex justify-between mb-2">
              <p
                onClick={() => fetchUserActivity(u._id)}
                className="text-sm font-semibold text-blue-600 cursor-pointer"
              >
                {u.email}
              </p>

              <span className={`text-xs px-2 py-1 rounded-full ${
                u.role === "super_admin"
                  ? "bg-black text-white"
                  : u.role === "admin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}>
                {u.role}
              </span>
            </div>

            {/* INFO */}
            <p className="text-sm text-gray-600">
              Units: <b>{u.units || 0}</b>
            </p>

            <p className="text-sm text-gray-600">
              Status:
              <span className={`ml-2 px-2 py-1 text-xs rounded ${
                u.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {u.status}
              </span>
            </p>

            {/* ACTIONS */}
            {u.role !== "super_admin" && (
              <div className="flex flex-wrap gap-2 mt-4">

                {/* STATUS */}
                {u.status === "active" ? (
                  <button
                    onClick={() => suspendUser(u._id)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded text-xs"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => activateUser(u._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Activate
                  </button>
                )}

                {/* UNITS */}
                <button
                  onClick={() => addUnits(u._id)}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  +Units
                </button>

                <button
                  onClick={() => deductUnits(u._id)}
                  className="bg-gray-800 text-white px-3 py-1 rounded text-xs"
                >
                  -Units
                </button>

                {/* ROLE CONTROL (ONLY SUPER ADMIN) */}
                {isSuperAdmin && (
                  <>
                    {u.role === "user" ? (
                      <button
                        onClick={() => makeAdmin(u._id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-xs"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        onClick={() => removeAdmin(u._id)}
                        className="bg-orange-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Remove Admin
                      </button>
                    )}
                  </>
                )}

                {/* DELETE (ONLY SUPER ADMIN) */}
                {isSuperAdmin && (
                  <button
                    onClick={() => deleteUser(u._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-xs"
                  >
                    Delete
                  </button>
                )}

              </div>
            )}

          </div>
        ))}

      </div>

      {/* ================= MODAL ================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-full max-w-2xl p-6 rounded-2xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">
              {selectedUser.email}
            </h2>

            <h3 className="font-semibold mb-2">User Activity</h3>

            <div className="space-y-2 max-h-60 overflow-y-auto">

              {userActivity.map((tx) => (
                <div key={tx._id} className="bg-gray-100 p-3 rounded text-sm">

                  <div className="flex justify-between">
                    <p className="font-medium">{tx.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <p>Units: {tx.units || 0}</p>
                  <p>Status: {tx.status}</p>

                </div>
              ))}

            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 text-red-500"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}