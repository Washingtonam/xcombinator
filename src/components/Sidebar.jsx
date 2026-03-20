import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-5">
      <h1 className="text-xl font-bold mb-10">NIN Portal</h1>

      <ul className="space-y-4">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/verify-nin">Verify NIN</Link></li>
        <li><Link to="/verify-bvn">Verify BVN</Link></li>
        <li><Link to="/transactions">Transactions</Link></li>
        <li><Link to="/wallet">Wallet</Link></li>
      </ul>
    </div>
  );
}