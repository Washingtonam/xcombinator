import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import VerifyNIN from "./pages/VerifyNIN";
import VerifyBVN from "./pages/VerifyBVN";
import Transactions from "./pages/Transactions";
import Wallet from "./pages/Wallet";

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;