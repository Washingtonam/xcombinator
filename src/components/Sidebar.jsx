import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "washingtonamedu@gmail.com";

  const headers = {
    email: localStorage.getItem("email"),
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // 🔥 FETCH PENDING PAYMENTS COUNT
  const fetchPendingPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/payments`, { headers });

      const pending = res.data.filter(p => p.status === "pending").length;
      setPendingPayments(pending);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingPayments();
    }
  }, []);

  // 🔥 ACTIVE LINK STYLE
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 p-2 rounded transition ${
      isActive(path)
        ? "bg-blue-700"
        : "hover:bg-blue-800"
    }`;

  return (
    <div
      className={`h-screen bg-blue-900 text-white p-4 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* TOP */}
      <div>
        {/* LOGO + TOGGLE */}
        <div className="flex items-center justify-between mb-10">
          {!collapsed && (
            <h1 className="text-xl font-bold">NIN Portal</h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="bg-blue-700 px-2 py-1 rounded"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        {/* MENU */}
        <ul className="space-y-2 text-sm">

          <li>
            <Link to="/" className={linkClass("/")}>
              📊 {!collapsed && "Dashboard"}
            </Link>
          </li>

          <li>
            <Link to="/verify-nin" className={linkClass("/verify-nin")}>
              🆔 {!collapsed && "Verify NIN"}
            </Link>
          </li>

          <li>
            <Link to="/verify-bvn" className={linkClass("/verify-bvn")}>
              🏦 {!collapsed && "Verify BVN"}
            </Link>
          </li>

          <li>
            <Link to="/transactions" className={linkClass("/transactions")}>
              📜 {!collapsed && "Transactions"}
            </Link>
          </li>

          <li>
            <Link to="/wallet" className={linkClass("/wallet")}>
              💰 {!collapsed && "Wallet"}
            </Link>
          </li>

          {/* ADMIN */}
          {isAdmin && (
            <>
              <li className="mt-6 text-gray-300 text-xs">
                {!collapsed && "ADMIN"}
              </li>

              <li>
                <Link to="/admin" className={linkClass("/admin")}>
                  ⚙️ {!collapsed && "Dashboard"}
                </Link>
              </li>

              <li>
                <Link to="/admin/users" className={linkClass("/admin/users")}>
                  👥 {!collapsed && "Users"}
                </Link>
              </li>

              <li>
                <Link to="/admin/payments" className={linkClass("/admin/payments")}>
                  💳 {!collapsed && "Payments"}

                  {/* 🔔 NOTIFICATION BADGE */}
                  {pendingPayments > 0 && (
                    <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
                      {pendingPayments}
                    </span>
                  )}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
      >
        {!collapsed ? "Logout" : "🚪"}
      </button>
    </div>
  );
}