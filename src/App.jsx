import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/public/Home";
import Sidebar from "./components/Sidebar";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminRequests from "./pages/admin/AdminRequests"; // 🔥 NEW

import Dashboard from "./pages/dashboard/Dashboard";

import VerifyNIN from "./pages/verification/VerifyNIN";
import VerifyBVN from "./pages/verification/VerifyBVN";
import VerifyResult from "./pages/verification/VerifyResult";

import NINServices from "./pages/services/NINServices";

// 🔥 NEW SERVICE PAGES
import Validation from "./pages/services/Validation";
import IPEClearance from "./pages/services/IPEClearance";
import Modification from "./pages/services/Modification";

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
function Layout() {
  return (
    <div className="flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-[#0B0B0B] min-h-screen transition-colors duration-300">

        <Routes>

          {/* ================= USER ================= */}
          <Route path="/" element={<Home />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          <Route path="/verify-nin" element={<ProtectedRoute><VerifyNIN /></ProtectedRoute>} />
          <Route path="/verify-bvn" element={<ProtectedRoute><VerifyBVN /></ProtectedRoute>} />

          <Route path="/verify-result" element={<ProtectedRoute><VerifyResult /></ProtectedRoute>} />

          {/* ================= 🔥 NIN SERVICES ================= */}
          <Route path="/nin-services" element={<ProtectedRoute><NINServices /></ProtectedRoute>} />

          <Route path="/nin-services/validation" element={<ProtectedRoute><Validation /></ProtectedRoute>} />
          <Route path="/nin-services/ipe-clearance" element={<ProtectedRoute><IPEClearance /></ProtectedRoute>} />
          <Route path="/nin-services/modification" element={<ProtectedRoute><Modification /></ProtectedRoute>} />

          {/* ================= WALLET ================= */}
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={<ProtectedRoute><AdminRoute><Admin /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/payments" element={<ProtectedRoute><AdminRoute><AdminPayments /></AdminRoute></ProtectedRoute>} />
          <Route path="/admin/pricing" element={<ProtectedRoute><AdminRoute><AdminPricing /></AdminRoute></ProtectedRoute>} />

          {/* 🔥 NEW: REQUEST MANAGEMENT */}
          <Route path="/admin/requests" element={<ProtectedRoute><AdminRoute><AdminRequests /></AdminRoute></ProtectedRoute>} />

        </Routes>

      </div>
    </div>
  );
}

// ==============================
// 🧠 ROUTE SWITCH
// ==============================
function AppRoutes() {
  const location = useLocation();

  // 🔥 PUBLIC PAGES (NO SIDEBAR)
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return (
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    );
  }

  // 🔥 PROTECTED APP (WITH SIDEBAR)
  return <Layout />;
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