import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";

import Dashboard from "./pages/Dashboard";
import VerifyNIN from "./pages/VerifyNIN";
import VerifyBVN from "./pages/VerifyBVN";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

function Layout() {
  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/verify-nin" element={<VerifyNIN />} />
          <Route path="/verify-bvn" element={<VerifyBVN />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/wallet" element={<Wallet />} />
        </Routes>
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  // 👉 if login page, don't show sidebar layout
  if (location.pathname === "/login") {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
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