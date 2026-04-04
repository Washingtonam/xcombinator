import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";

import Dashboard from "./pages/dashboard/Dashboard";
import VerifyNIN from "./pages/verification/VerifyNIN";
import VerifyBVN from "./pages/verification/VerifyBVN";
import Transactions from "./pages/transactions/Transactions";
import Wallet from "./pages/wallet/Wallet";
import { ThemeProvider } from "./context/ThemeContext";


// ==============================
// 🔐 AUTH CHECKS
// ==============================
function isAuthenticated() {
  return !!localStorage.getItem("user");
}

function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.email === "washingtonamedu@gmail.com";
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/" />;
  return children;
}

// ==============================
// 📦 LAYOUT
// ==============================
function Layout({ toggleTheme, dark }) {
  return (
    <div className="flex">

      {/* SIDEBAR */}
      <Sidebar toggleTheme={toggleTheme} dark={dark} />

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-[#0B0B0B] min-h-screen transition-colors duration-300">
        <Routes>

          {/* USER ROUTES */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verify-nin" element={<ProtectedRoute><VerifyNIN /></ProtectedRoute>} />
          <Route path="/verify-bvn" element={<ProtectedRoute><VerifyBVN /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

          {/* ADMIN DASHBOARD */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />

          {/* ADMIN USERS */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />

          {/* ADMIN PAYMENTS */}
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPayments />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />

          {/* ADMIN PRICING */}
          <Route 
            path="/admin/pricing" 
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminPricing />
                </AdminRoute>
              </ProtectedRoute>
            } 
          />

        </Routes>
      </div>
    </div>
  );
}

// ==============================
// 🧠 ROUTE SWITCH
// ==============================
function AppRoutes({ toggleTheme, dark }) {
  const location = useLocation();

  // AUTH PAGES (NO SIDEBAR)
  if (location.pathname === "/login" || location.pathname === "/register") {
    return (
      <div className="bg-gray-100 dark:bg-[#0B0B0B] min-h-screen transition">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  return <Layout toggleTheme={toggleTheme} dark={dark} />;
}

// ==============================
// 🚀 MAIN APP
// ==============================
export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <BrowserRouter>
      <AppRoutes toggleTheme={() => setDark(!dark)} dark={dark} />
    </BrowserRouter>
  );
}