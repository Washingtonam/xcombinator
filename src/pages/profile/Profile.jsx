import { useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function Profile() {

  const user = JSON.parse(localStorage.getItem("user"));

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CHANGE PASSWORD
  // =========================
  const handleChangePassword = async () => {

    if (!currentPassword || !newPassword) {
      return alert("Fill all fields");
    }

    if (newPassword.length < 6) {
      return alert("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert("✅ Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      {/* ================= USER INFO ================= */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">

        <h2 className="font-semibold mb-4">
          Account Information
        </h2>

        <div className="space-y-2 text-sm">
          <p><b>Email:</b> {user?.email}</p>
          <p><b>Role:</b> {user?.role}</p>
          <p><b>Units:</b> {user?.units || 0}</p>
        </div>

      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">

        <h2 className="font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <a
            href="/wallet"
            className="bg-blue-600 text-white p-4 rounded-xl text-center font-medium hover:bg-blue-700 transition"
          >
            💳 Fund Wallet
          </a>

          <a
            href="/transactions"
            className="bg-gray-800 text-white p-4 rounded-xl text-center font-medium hover:bg-gray-900 transition"
          >
            📜 View Transactions
          </a>

        </div>

      </div>

      {/* ================= CHANGE PASSWORD ================= */}
      <div className="bg-white p-6 rounded-2xl shadow">

        <h2 className="font-semibold mb-4">
          Change Password
        </h2>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border p-3 rounded-xl"
          />

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

        </div>

      </div>

    </div>
  );
}