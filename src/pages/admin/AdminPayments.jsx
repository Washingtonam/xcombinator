import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState("all");
  const [unitPrice, setUnitPrice] = useState(250);
  const [loadingId, setLoadingId] = useState(null);

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
  // FETCH PRICING
  // =========================
  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/pricing`);
      setUnitPrice(res.data?.nin?.unitPrice || 250);
    } catch (err) {
      console.error("Pricing error:", err);
    }
  };

  // =========================
  // APPROVE
  // =========================
  const approve = async (id) => {
    setLoadingId(id);

    try {
      await axios.post(
        `${API_BASE}/api/admin/payments/${id}/approve`,
        {},
        { headers }
      );

      fetchPayments();
    } catch (err) {
      alert("Approval failed");
    }

    setLoadingId(null);
  };

  // =========================
  // REJECT
  // =========================
  const reject = async (id) => {
    setLoadingId(id);

    try {
      await axios.post(
        `${API_BASE}/api/admin/payments/${id}/reject`,
        {},
        { headers }
      );

      fetchPayments();
    } catch (err) {
      alert("Rejection failed");
    }

    setLoadingId(null);
  };

  useEffect(() => {
    fetchPayments();
    fetchPricing();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filteredPayments = payments.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">Payment Requests</h1>

      <p className="text-gray-500 mb-6">
        Unit Price: <b>₦{unitPrice}</b> per unit
      </p>

      {/* FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
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

      {/* EMPTY */}
      {filteredPayments.length === 0 && (
        <p className="text-gray-500">No payments found</p>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {filteredPayments.map((p) => {
          const units = Math.floor(p.amount / unitPrice);

          return (
            <div
              key={p._id}
              className="bg-white p-5 rounded-xl shadow border"
            >

              {/* HEADER */}
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-sm">
                  {p.userId?.email}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded ${
                    p.status === "pending"
                      ? "bg-yellow-400"
                      : p.status === "approved"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              {/* AMOUNT */}
              <p className="text-sm">
                Amount: <b>₦{p.amount}</b>
              </p>

              {/* 🔥 UNITS CALC */}
              <p className="text-blue-600 font-semibold text-sm mb-2">
                ≈ {units} units
              </p>

              {/* PROOF */}
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
                    disabled={loadingId === p._id}
                    className={`flex-1 py-2 rounded text-white text-sm ${
                      loadingId === p._id
                        ? "bg-gray-400"
                        : "bg-green-600"
                    }`}
                  >
                    {loadingId === p._id
                      ? "Processing..."
                      : `Approve (+${units} units)`}
                  </button>

                  <button
                    onClick={() => reject(p._id)}
                    disabled={loadingId === p._id}
                    className="flex-1 py-2 rounded bg-red-600 text-white text-sm"
                  >
                    Reject
                  </button>

                </div>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}