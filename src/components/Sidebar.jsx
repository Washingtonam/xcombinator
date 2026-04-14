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
    `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive(path)
        ? "bg-white/10 border-l-4 border-white"
        : "hover:bg-white/5"
    }`;

  return (
    <>
      {/* 🔥 FLOATING TOGGLE BUTTON */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 backdrop-blur-lg bg-black/70 text-white px-3 py-2 rounded-xl shadow-lg hover:scale-105 transition"
      >
        ☰
      </button>

      {/* 🔥 OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {/* 🔥 SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full bg-gradient-to-b from-blue-900/95 to-blue-800/90 backdrop-blur-xl text-white p-6 flex flex-col justify-between shadow-2xl">

          {/* HEADER */}
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-xl font-semibold tracking-tight">
                Xcombinator
              </h1>

              <button
                onClick={() => setOpen(false)}
                className="text-lg hover:scale-110 transition"
              >
                ✕
              </button>
            </div>

            {/* NAV */}
            <ul className="space-y-2 text-sm">

              <li>
                <Link to="/dashboard" className={linkClass("/dashboard")} onClick={() => setOpen(false)}>
                  📊 Dashboard
                </Link>
              </li>

              <li>
                <Link to="/verify-nin" className={linkClass("/verify-nin")} onClick={() => setOpen(false)}>
                  🆔 Verify NIN
                </Link>
              </li>

              <li>
                <Link to="/nin-services" className={linkClass("/nin-services")} onClick={() => setOpen(false)}>
                  🏦 NIN Services
                </Link>
              </li>

              <li>
                <Link to="/transactions" className={linkClass("/transactions")} onClick={() => setOpen(false)}>
                  📜 Transactions
                </Link>
              </li>

              <li>
                <Link to="/wallet" className={linkClass("/wallet")} onClick={() => setOpen(false)}>
                  ⚡ Buy Units
                </Link>
              </li>

              <li>
                <Link to="/my-requests" className={linkClass("/my-requests")} onClick={() => setOpen(false)}>
                  📦 My Requests
                </Link>
              </li>

              {/* ADMIN */}
              {isAdmin && (
                <>
                  <li className="mt-6 text-xs text-white/50 uppercase tracking-wider">
                    Admin
                  </li>

                  <li>
                    <Link to="/admin" className={linkClass("/admin")} onClick={() => setOpen(false)}>
                      ⚙️ Dashboard
                    </Link>
                  </li>

                  <li>
                    <Link to="/admin/users" className={linkClass("/admin/users")} onClick={() => setOpen(false)}>
                      👥 Users
                    </Link>
                  </li>

                  <li>
                    <Link to="/admin/payments" className={linkClass("/admin/payments")} onClick={() => setOpen(false)}>
                      <span>💳 Payments</span>
                      {pendingPayments > 0 && (
                        <span className="bg-red-500/80 text-xs px-2 py-0.5 rounded-full">
                          {pendingPayments}
                        </span>
                      )}
                    </Link>
                  </li>

                  <li>
                    <Link to="/admin/requests" className={linkClass("/admin/requests")} onClick={() => setOpen(false)}>
                      <span>📥 Requests</span>
                      {pendingRequests > 0 && (
                        <span className="bg-yellow-500/80 text-xs px-2 py-0.5 rounded-full">
                          {pendingRequests}
                        </span>
                      )}
                    </Link>
                  </li>

                  <li>
                    <Link to="/admin/pricing" className={linkClass("/admin/pricing")} onClick={() => setOpen(false)}>
                      💲 Pricing
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* FOOTER */}
          <div className="space-y-3">

            <button
              onClick={toggleTheme}
              className="w-full bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl py-2 transition"
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-600/90 hover:bg-red-700 rounded-xl py-2 transition"
            >
              Logout
            </button>

          </div>
        </div>
      </div>
    </>
  );
}