import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, balance } = useUser();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Welcome, {user?.email}</h1>
      <p className="mb-6 text-gray-600">
        Manage your verifications and wallet from here.
      </p>

      {/* 🔥 BALANCE CARD */}
      <div className="bg-blue-600 text-white p-6 rounded-xl mb-8 shadow">
        <p className="text-sm">Wallet Balance</p>
        <h2 className="text-3xl font-bold">₦{balance}</h2>
      </div>

      {/* 🔥 ACTION GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

        <div
          onClick={() => navigate("/verify-nin")}
          className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold mb-2">Verify NIN</h3>
          <p className="text-sm text-gray-500">
            Check NIN details instantly
          </p>
        </div>

        <div
          onClick={() => navigate("/verify-bvn")}
          className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold mb-2">Verify BVN</h3>
          <p className="text-sm text-gray-500">
            Verify BVN records
          </p>
        </div>

        <div
          onClick={() => navigate("/wallet")}
          className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold mb-2">Wallet</h3>
          <p className="text-sm text-gray-500">
            Fund and manage balance
          </p>
        </div>

        <div
          onClick={() => navigate("/transactions")}
          className="bg-white p-6 rounded-xl shadow cursor-pointer hover:shadow-lg transition"
        >
          <h3 className="font-semibold mb-2">Transactions</h3>
          <p className="text-sm text-gray-500">
            View your history
          </p>
        </div>

      </div>
    </div>
  );
}