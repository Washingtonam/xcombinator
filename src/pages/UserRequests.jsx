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
        `${API_BASE}/api/user/requests/${user.id}`
      );

      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // STATUS STYLE
  // =========================
  const statusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400 text-black";
      case "approved":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      case "rejected":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300";
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-2">
        My Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Track all your submitted NIN services
      </p>

      {requests.length === 0 && (
        <p className="text-gray-500">No requests yet</p>
      )}

      <div className="grid md:grid-cols-2 gap-5">

        {requests.map((r) => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-xl shadow border"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-sm">
                {r.service.toUpperCase()}
              </span>

              <span className={`text-xs px-2 py-1 rounded ${statusStyle(r.status)}`}>
                {r.status}
              </span>
            </div>

            {/* DETAILS */}
            <div className="text-sm space-y-1 mb-3">
              <p><b>Type:</b> {r.type}</p>
              <p><b>NIN:</b> {r.nin}</p>
              <p><b>Amount:</b> ₦{r.amount}</p>
              <p><b>Date:</b> {new Date(r.createdAt).toLocaleString()}</p>
            </div>

            {/* STATUS MESSAGE */}
            {r.status === "pending" && (
              <div className="text-yellow-600 text-sm">
                ⏳ Waiting for admin approval
              </div>
            )}

            {r.status === "approved" && (
              <div className="text-green-600 text-sm">
                ✅ Approved — Processing in progress
              </div>
            )}

            {r.status === "rejected" && (
              <div className="text-red-600 text-sm">
                ❌ Request rejected — contact support
              </div>
            )}

            {/* DOWNLOAD */}
            {r.status === "completed" && r.resultSlip && (
              <a
                href={r.resultSlip}
                download="nin-slip.pdf"
                className="block text-center mt-3 bg-blue-600 text-white py-2 rounded"
              >
                Download Slip
              </a>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}