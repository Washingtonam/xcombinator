import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Home from "./pages/public/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminRequests from "./pages/admin/AdminRequests";

import Dashboard from "./pages/dashboard/Dashboard";

import VerifyNIN from "./pages/verification/VerifyNIN";
import VerifyBVN from "./pages/verification/VerifyBVN";
import VerifyResult from "./pages/verification/VerifyResult";

import NINServices from "./pages/services/NINServices";
import Validation from "./pages/services/Validation";
import IPEClearance from "./pages/services/IPEClearance";
import Modification from "./pages/services/Modification";

import Transactions from "./pages/transactions/Transactions";
import Wallet from "./pages/wallet/Wallet";

import { ThemeProvider } from "./context/ThemeContext";

// ==============================
// 🔐 AUTH
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
  if (!isAdmin()) return <Navigate to="/dashboard" />;
  return children;
}

// ==============================
// 📦 APP LAYOUT (WITH SIDEBAR)
// ==============================
function Layout() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 p-4 md:p-6 bg-gray-100 dark:bg-[#0B0B0B] min-h-screen">

        <Routes>

          {/* 🔥 MAIN APP */}
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/verify-nin" element={<VerifyNIN />} />
          <Route path="/verify-bvn" element={<VerifyBVN />} />
          <Route path="/verify-result" element={<VerifyResult />} />

          {/* NIN SERVICES */}
          <Route path="/nin-services" element={<NINServices />} />
          <Route path="/nin-services/validation" element={<Validation />} />
          <Route path="/nin-services/ipe-clearance" element={<IPEClearance />} />
          <Route path="/nin-services/modification" element={<Modification />} />

          {/* WALLET */}
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/pricing" element={<AdminRoute><AdminPricing /></AdminRoute>} />
          <Route path="/admin/requests" element={<AdminRoute><AdminRequests /></AdminRoute>} />

        </Routes>

      </div>
    </div>
  );
}

// ==============================
// 🔥 ROUTE CONTROLLER
// ==============================
function AppRoutes() {
  const location = useLocation();

  const publicRoutes = ["/", "/login", "/register"];

  if (publicRoutes.includes(location.pathname)) {
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
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