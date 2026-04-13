import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function UserRequests() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH USER REQUESTS
  // =========================
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/user/requests/${user?.id}`
      );

      setRequests(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
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
  // STATUS MESSAGE
  // =========================
  const statusMessage = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Waiting for admin approval";
      case "approved":
        return "⚙️ Processing in progress";
      case "completed":
        return "🎉 Completed — ready for download";
      case "rejected":
        return "❌ Rejected — contact support";
      default:
        return "";
    }
  };

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your requests...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        My Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Track your payments, approvals and completed services
      </p>

      {/* EMPTY STATE */}
      {requests.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          <p className="text-gray-500">
            No requests yet — start a service to see activity here
          </p>
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {requests.map((r) => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-2xl shadow border hover:shadow-lg transition"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-3">

              <div className="text-sm font-semibold">
                {r.service?.toUpperCase()}
              </div>

              <span
                className={`text-xs px-3 py-1 rounded-full ${statusStyle(r.status)}`}
              >
                {r.status}
              </span>

            </div>

            {/* DETAILS */}
            <div className="text-sm space-y-1 mb-3">
              <p><b>Type:</b> {r.type}</p>
              <p><b>NIN:</b> {r.nin}</p>
              <p><b>Amount:</b> ₦{r.amount}</p>
              <p>
                <b>Date:</b>{" "}
                {r.createdAt
                  ? new Date(r.createdAt).toLocaleString()
                  : "-"}
              </p>
            </div>

            {/* STATUS MESSAGE */}
            <div className="text-sm mb-3 text-gray-600">
              {statusMessage(r.status)}
            </div>

            {/* PROOF PREVIEW */}
            {r.proof && (
              <img
                src={r.proof}
                alt="payment proof"
                className="w-full h-32 object-cover rounded mb-3"
              />
            )}

            {/* DOWNLOAD */}
            {r.status === "completed" && r.resultSlip && (
              <a
                href={r.resultSlip}
                download="nin-slip.pdf"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                📥 Download Slip
              </a>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}