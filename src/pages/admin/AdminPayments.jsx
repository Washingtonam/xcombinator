import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH PAYMENTS
  // =========================
  const fetchPayments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/payments`, { headers });

      const sorted = res.data.sort((a, b) => {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        return 0;
      });

      setPayments(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // ACTIONS
  // =========================
  const approve = async (id) => {
    await axios.post(`${API_BASE}/api/admin/payments/${id}/approve`, {}, { headers });
    fetchPayments();
  };

  const reject = async (id) => {
    await axios.post(`${API_BASE}/api/admin/payments/${id}/reject`, {}, { headers });
    fetchPayments();
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // =========================
  // FILTER LOGIC
  // =========================
  const filteredPayments = payments.filter(p => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-6">Payment Requests</h1>

      {/* FILTERS */}
      <div className="flex gap-3 mb-6">
        {["all", "pending", "approved", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded text-sm ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LIST */}
      {filteredPayments.length === 0 && (
        <p className="text-gray-500">No payments found</p>
      )}

      <div className="grid md:grid-cols-2 gap-4">

        {filteredPayments.map(p => (
          <div key={p._id} className="bg-white p-4 rounded shadow">

            <div className="flex justify-between mb-2">
              <p className="font-medium">{p.userId?.email}</p>
              <span className={`text-xs px-2 py-1 rounded ${
                p.status === "pending"
                  ? "bg-yellow-400"
                  : p.status === "approved"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}>
                {p.status}
              </span>
            </div>

            <p className="mb-2">Amount: ₦{p.amount}</p>

            {p.proof && (
              <img
                src={p.proof}
                alt="proof"
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            {/* ACTIONS */}
            {p.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(p._id)}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  Approve
                </button>

                <button
                  onClick={() => reject(p._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Reject
                </button>
              </div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}