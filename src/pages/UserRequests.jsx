import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH
  // =========================
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/user/requests/${user?.id}`
      );
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) fetchRequests();
  }, []);

  // =========================
  // STATUS STYLE
  // =========================
  const statusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">My Requests</h1>
      <p className="text-gray-500 mb-6">
        Track your payments, processing, and completed services
      </p>

      {/* EMPTY */}
      {requests.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center shadow">
          No requests yet
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {requests.map((r) => (
          <div
            key={r._id}
            onClick={() => setActive(r)}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
              <div className="font-semibold text-sm">
                {r.service?.toUpperCase()}
              </div>

              <span className={`px-3 py-1 text-xs rounded-full ${statusStyle(r.status)}`}>
                {r.status}
              </span>
            </div>

            {/* AMOUNT */}
            <div className="text-xl font-bold mb-2">
              ₦{r.amount}
            </div>

            {/* DETAILS */}
            <div className="text-sm text-gray-600">
              {r.type} • {r.nin}
            </div>

          </div>
        ))}

      </div>

      {/* ================= MODAL ================= */}
      {active && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">
                Request Details
              </h2>

              <button onClick={() => setActive(null)}>✕</button>
            </div>

            {/* BASIC */}
            <div className="space-y-1 text-sm mb-4">
              <p><b>Service:</b> {active.service}</p>
              <p><b>Type:</b> {active.type}</p>
              <p><b>NIN:</b> {active.nin}</p>
              <p><b>Amount:</b> ₦{active.amount}</p>
            </div>

            {/* ================= STATUS TIMELINE ================= */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Progress</h3>

              <div className="space-y-2">
                {active.statusHistory?.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="font-medium">{s.status}</p>
                      <p className="text-gray-500 text-xs">{s.note}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(s.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ================= COMMENTS ================= */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Conversation</h3>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {active.comments?.map((c, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm ${
                      c.role === "admin"
                        ? "bg-gray-100"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <b>{c.by}</b>
                    <p>{c.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* PROOF */}
            {active.proof && (
              <img
                src={active.proof}
                className="w-full rounded mb-4"
              />
            )}

            {/* DOWNLOAD */}
            {active.status === "completed" && active.resultSlip && (
              <a
                href={active.resultSlip}
                download="nin-slip.pdf"
                className="block text-center bg-blue-600 text-white py-2 rounded"
              >
                Download Result
              </a>
            )}

          </div>

        </div>
      )}

    </div>
  );
}