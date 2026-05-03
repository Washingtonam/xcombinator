import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://xcombinator.onrender.com";

export default function Profile() {

  const navigate = useNavigate();

  // ✅ SAFE USER PARSE
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  // 🔥 AUTO REDIRECT IF NO USER
  if (!storedUser) {
    window.location.href = "/login";
    return null;
  }

  const user = storedUser;

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
      alert(err.message || "Failed to update password");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">
        My Profile
      </h1>

      {/* USER INFO */}
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

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6">
        <h2 className="font-semibold mb-4">
          Quick Actions
        </h2>

        <div className="grid md:grid-cols-2 gap-4">

          <button
            onClick={() => navigate("/wallet")}
            className="bg-blue-600 text-white p-4 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            💳 Fund Wallet
          </button>

          <button
            onClick={() => navigate("/transactions")}
            className="bg-gray-800 text-white p-4 rounded-xl font-medium hover:bg-gray-900 transition"
          >
            📜 View Transactions
          </button>

        </div>
      </div>

      {/* CHANGE PASSWORD */}
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