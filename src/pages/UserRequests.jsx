import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function UserRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH (PAGINATED + FIXED)
  // =========================
  const fetchRequests = async (pageNum = 1, append = false) => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/user/requests/${user?._id}?page=${pageNum}&limit=10`
      );

      const newData = res.data?.data || [];

      if (append) {
        setRequests(prev => [...prev, ...newData]);
      } else {
        setRequests(newData);
      }

      const currentPage = res.data?.pagination?.page || 1;
      const totalPages = res.data?.pagination?.pages || 1;

      setHasMore(currentPage < totalPages);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user?._id) fetchRequests(1);
  }, []);

  // =========================
  // LOAD MORE
  // =========================
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRequests(nextPage, true);
  };

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
  // STATUS TEXT
  // =========================
  const statusText = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Waiting for review";
      case "approved":
        return "⚙️ Processing";
      case "completed":
        return "✅ Completed";
      case "rejected":
        return "❌ Issue found";
      default:
        return status;
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading your requests...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        My Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Track your payments, processing, and completed services
      </p>

      {/* EMPTY */}
      {requests.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center shadow">
          No requests yet
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">

        {requests.map((r) => (
          <div
            key={r._id}
            onClick={() => setActive(r)}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex justify-between items-center"
          >

            {/* LEFT */}
            <div>
              <p className="font-semibold text-gray-800">
                {r.service?.toUpperCase()} • {r.type}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(r.createdAt).toLocaleString()}
              </p>

              <p className="text-xs text-gray-400">
                NIN: {r.nin}
              </p>
            </div>

            {/* RIGHT */}
            <div className="text-right">

              <p className="font-bold text-lg">
                ₦{r.amount}
              </p>

              <span className={`text-xs px-3 py-1 rounded-full ${statusStyle(r.status)}`}>
                {statusText(r.status)}
              </span>

            </div>

          </div>
        ))}

      </div>

      {/* LOAD MORE */}
      {hasMore && requests.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg"
          >
            Load More
          </button>
        </div>
      )}

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

            {/* STATUS */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs ${statusStyle(active.status)}`}>
                {statusText(active.status)}
              </span>
            </div>

            {/* TIMELINE */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Progress</h3>

              <div className="space-y-2">
                {active.statusHistory?.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <p className="font-medium capitalize">{s.status}</p>
                      <p className="text-gray-500 text-xs">{s.note}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(s.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COMMENTS */}
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
                alt="proof"
                className="w-full rounded mb-4"
              />
            )}

            {/* DOWNLOAD */}
            {active.status === "completed" && active.resultSlip && (
              <a
                href={active.resultSlip}
                download="nin-slip.pdf"
                className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
              >
                📥 Download Result Slip
              </a>
            )}

            {/* TRUST */}
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>✔ Secure processing</p>
              <p>✔ Admin verified</p>
              <p>✔ Status updates available</p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}