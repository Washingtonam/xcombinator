import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

const API_BASE = "https://xcombinator.onrender.com";

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const [open, setOpen] = useState(false);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "washingtonamedu@gmail.com";

  const headers = {
    email: localStorage.getItem("email"),
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // =========================
  // FETCH ADMIN DATA
  // =========================
  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      try {
        const payRes = await axios.get(`${API_BASE}/api/admin/payments`, { headers });
        setPendingPayments(payRes.data.filter(p => p.status === "pending").length);

        const reqRes = await axios.get(`${API_BASE}/api/admin/requests`, { headers });
        setPendingRequests(reqRes.data.filter(r => r.status === "pending").length);

      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  // =========================
  // ACTIVE LINK
  // =========================
  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `flex items-center justify-between p-3 rounded-lg transition ${
      isActive(path)
        ? "bg-blue-700"
        : "hover:bg-blue-800"
    }`;

  return (
    <>
      {/* 🔥 FLOATING MENU BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 bg-black text-white px-3 py-2 rounded-lg shadow-lg"
      >
        ☰
      </button>

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* 🔥 SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white p-5 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">NIN Portal</h1>

          <button onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* MENU */}
        <ul className="space-y-2 text-sm">

          <li>
            <Link to="/dashboard" className={linkClass("/dashboard")} onClick={() => setOpen(false)}>
              <span>📊 Dashboard</span>
            </Link>
          </li>

          <li>
            <Link to="/verify-nin" className={linkClass("/verify-nin")} onClick={() => setOpen(false)}>
              <span>🆔 Verify NIN</span>
            </Link>
          </li>

          <li>
            <Link to="/nin-services" className={linkClass("/nin-services")} onClick={() => setOpen(false)}>
              <span>🏦 NIN Services</span>
            </Link>
          </li>

          <li>
            <Link to="/transactions" className={linkClass("/transactions")} onClick={() => setOpen(false)}>
              <span>📜 Transactions</span>
            </Link>
          </li>

          <li>
            <Link to="/wallet" className={linkClass("/wallet")} onClick={() => setOpen(false)}>
              <span>⚡ Buy Units</span>
            </Link>
          </li>

          {/* ADMIN */}
          {isAdmin && (
            <>
              <li className="mt-6 text-xs text-gray-300">ADMIN</li>

              <li>
                <Link to="/admin" className={linkClass("/admin")} onClick={() => setOpen(false)}>
                  <span>⚙️ Dashboard</span>
                </Link>
              </li>

              <li>
                <Link to="/admin/users" className={linkClass("/admin/users")} onClick={() => setOpen(false)}>
                  <span>👥 Users</span>
                </Link>
              </li>

              <li>
                <Link to="/admin/payments" className={linkClass("/admin/payments")} onClick={() => setOpen(false)}>
                  <span>💳 Payments</span>

                  {pendingPayments > 0 && (
                    <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">
                      {pendingPayments}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link to="/admin/requests" className={linkClass("/admin/requests")} onClick={() => setOpen(false)}>
                  <span>📥 Requests</span>

                  {pendingRequests > 0 && (
                    <span className="bg-yellow-500 text-xs px-2 py-0.5 rounded-full">
                      {pendingRequests}
                    </span>
                  )}
                </Link>
              </li>

              <li>
                <Link to="/admin/pricing" className={linkClass("/admin/pricing")} onClick={() => setOpen(false)}>
                  <span>💲 Pricing</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* FOOTER */}
        <div className="mt-10 space-y-3">

          <button
            onClick={toggleTheme}
            className="w-full bg-gray-700 py-2 rounded"
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 py-2 rounded"
          >
            Logout
          </button>

        </div>
      </div>
    </>
  );
}