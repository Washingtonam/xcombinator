import { Link, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.email === "washingtonamedu@gmail.com";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-64 h-screen bg-blue-900 text-white p-5 flex flex-col justify-between">
      
      <div>
        <h1 className="text-xl font-bold mb-10">NIN Portal</h1>

        <ul className="space-y-4">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/verify-nin">Verify NIN</Link></li>
          <li><Link to="/verify-bvn">Verify BVN</Link></li>
          <li><Link to="/transactions">Transactions</Link></li>
          <li><Link to="/wallet">Wallet</Link></li>

          {/* 🔥 ADMIN ONLY */}
          {isAdmin && <li><Link to="/admin">Admin</Link></li>}
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded mt-10"
      >
        Logout
      </button>
      
    </div>
  );
}