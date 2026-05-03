import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminRequests from "./pages/admin/AdminRequests";

import Dashboard from "./pages/dashboard/Dashboard";

import VerifyNIN from "./pages/verification/VerifyNIN";
import VerifyBVN from "./pages/verification/VerifyBVN";
import VerifyResult from "./pages/verification/VerifyResult";
import UserRequests from "./pages/UserRequests";

import NINServices from "./pages/services/NINServices";
import Validation from "./pages/services/Validation";
import IPEClearance from "./pages/services/IPEClearance";
import Modification from "./pages/services/Modification";

import Transactions from "./pages/transactions/Transactions";
import Wallet from "./pages/wallet/Wallet";

// ✅ ADD THIS
import Profile from "./pages/Profile";

import { ThemeProvider } from "./context/ThemeContext";

// ==============================
// 🔐 AUTH
// ==============================
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

function isAuthenticated() {
  return !!localStorage.getItem("user");
}

function isAdmin() {
  const user = getUser();
  return user?.role === "admin" || user?.role === "super_admin";
}

function isSuperAdmin() {
  const user = getUser();
  return user?.role === "super_admin";
}

// ==============================
// 🔐 ROUTE GUARDS
// ==============================
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

function SuperAdminRoute({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (!isSuperAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

// ==============================
// 📦 APP LAYOUT
// ==============================
function Layout() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-[#0B0B0B] min-h-screen">

        <Routes>

          {/* ================= MAIN ================= */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* ✅ FIXED PROFILE ROUTE */}
          <Route path="/profile" element={<Profile />} />

          <Route path="/verify-nin" element={<VerifyNIN />} />
          <Route path="/verify-bvn" element={<VerifyBVN />} />
          <Route path="/verify-result" element={<VerifyResult />} />
          <Route path="/my-requests" element={<UserRequests />} />

          {/* ================= SERVICES ================= */}
          <Route path="/nin-services" element={<NINServices />} />
          <Route path="/nin-services/validation" element={<Validation />} />
          <Route path="/nin-services/ipe-clearance" element={<IPEClearance />} />
          <Route path="/nin-services/modification" element={<Modification />} />

          {/* ================= WALLET ================= */}
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />

          {/* ================= ADMIN ================= */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />

          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />

          <Route path="/admin/payments" element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          } />

          <Route path="/admin/requests" element={
            <AdminRoute>
              <AdminRequests />
            </AdminRoute>
          } />

          <Route path="/admin/pricing" element={
            <SuperAdminRoute>
              <AdminPricing />
            </SuperAdminRoute>
          } />

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>

      </div>
    </div>
  );
}

// ==============================
// 🚀 ROUTE CONTROLLER
// ==============================
function AppRoutes() {
  const location = useLocation();
  const loggedIn = isAuthenticated();

  if (location.pathname === "/") {
    return loggedIn
      ? <Navigate to="/dashboard" />
      : <Home />;
  }

  if (location.pathname === "/login") {
    return loggedIn ? <Navigate to="/dashboard" /> : <Login />;
  }

  if (location.pathname === "/register") {
    return loggedIn ? <Navigate to="/dashboard" /> : <Register />;
  }

  if (location.pathname === "/forgot-password") {
    return <ForgotPassword />;
  }

  if (location.pathname === "/reset-password") {
    return <ResetPassword />;
  }

  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
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