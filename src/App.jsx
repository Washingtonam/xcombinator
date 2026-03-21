import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";

import Dashboard from "./pages/Dashboard";
import VerifyNIN from "./pages/VerifyNIN";
import VerifyBVN from "./pages/VerifyBVN";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

// 🔐 CHECK AUTH
function isAuthenticated() {
  return !!localStorage.getItem("user");
}

// 🔐 PROTECTED ROUTE
function ProtectedRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
}

// 🔐 ADMIN ROUTE (frontend only checks login now)
function AdminRoute({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
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

          {/* ADMIN */}
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

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;