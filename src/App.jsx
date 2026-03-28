import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Admin from "./pages/admin/Admin";

import Dashboard from "./pages/dashboard/Dashboard";
import VerifyNIN from "./pages/verification/VerifyNIN";
import VerifyBVN from "./pages/verification/VerifyBVN";
import Transactions from "./pages/transactions/Transactions";
import Wallet from "./pages/wallet/Wallet";

function isAuthenticated() {
  return !!localStorage.getItem("user");
}

function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user"));
  return user?.email === "washingtonamedu@gmail.com";
}

function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

// 🔥 FIXED ADMIN ROUTE
function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" />;
  }

  return children;
}

function Layout() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verify-nin" element={<ProtectedRoute><VerifyNIN /></ProtectedRoute>} />
          <Route path="/verify-bvn" element={<ProtectedRoute><VerifyBVN /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />

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
        </Routes>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  return <Layout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}