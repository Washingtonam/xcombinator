import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "https://xcombinator.onrender.com";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "washingtonamedu@gmail.com";

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // 🔥 FIXED LOGOUT (CRITICAL)
  // =========================
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("email");

    // 🔥 FORCE FULL RESET (prevents auto-login bug)
    window.location.href = "/login";
  };

  // =========================
  // FETCH ADMIN DATA
  // =========================
  const fetchPendingPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/payments`, { headers });
      const pending = res.data.filter(p => p.status === "pending").length;
      setPendingPayments(pending);
    } catch (err) {
      console.error("Payment fetch error:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchPendingPayments();
  }, []);

  // =========================
  // ACTIVE LINK
  // =========================
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center gap-3 p-3 rounded-lg transition ${
      isActive(path)
        ? "bg-blue-700"
        : "hover:bg-blue-800"
    }`;

  // =========================
  // SIDEBAR CONTENT
  // =========================
  const SidebarContent = () => (
    <>
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between mb-8">

          {!collapsed && (
            <h1 className="text-xl font-bold">NIN Portal</h1>
          )}

          <div className="flex items-center gap-2">

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs transition"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* COLLAPSE */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="bg-blue-700 px-2 py-1 rounded text-xs"
            >
              {collapsed ? "➡️" : "⬅️"}
            </button>
          </div>
        </div>

        {/* MENU */}
        <ul className="space-y-2 text-sm">

          {/* 🔥 FIXED DASHBOARD ROUTE */}
          <li>
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              📊 {!collapsed && "Dashboard"}
            </Link>
          </li>

          <li>
            <Link to="/verify-nin" className={linkClass("/verify-nin")}>
              🆔 {!collapsed && "Verify NIN"}
            </Link>
          </li>

          <li>
            <Link to="/nin-services" className={linkClass("/nin-services")}>
              🏦 {!collapsed && "NIN Services"}
            </Link>
          </li>

          <li>
            <Link to="/transactions" className={linkClass("/transactions")}>
              📜 {!collapsed && "Transactions"}
            </Link>
          </li>

          <li>
            <Link to="/wallet" className={linkClass("/wallet")}>
              ⚡ {!collapsed && "Buy Units"}
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

                  {pendingPayments > 0 && (
                    <span className="ml-auto bg-red-500 text-xs px-2 py-0.5 rounded-full">
                      {pendingPayments}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link to="/admin/pricing" className={linkClass("/admin/pricing")}>
                  💲 {!collapsed && "Pricing"}
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm transition"
      >
        {!collapsed ? "Logout" : "🚪"}
      </button>
    </>
  );

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between bg-blue-900 text-white p-3">
        <button onClick={() => setMobileOpen(true)}>☰</button>

        <h1 className="font-bold">NIN Portal</h1>

        <button onClick={toggleTheme}>
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed md:relative z-50 h-screen bg-blue-900 text-white p-4 flex flex-col justify-between transition-all duration-300
          ${collapsed ? "w-20" : "w-64"}
          ${mobileOpen ? "left-0" : "-left-full md:left-0"}
        `}
      >
        <SidebarContent />
      </div>
    </>
  );
}