import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending"); // 🔥 default = pending (smart)
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // 🚀 FETCH (OPTIMIZED)
  // =========================
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/admin/requests`, { headers });

      // 🔥 PRIORITIZE PENDING FIRST
      const sorted = res.data.sort((a, b) => {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setRequests(sorted);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // FILTER
  // =========================
  const filtered = requests.filter(r =>
    filter === "all" ? true : r.status === filter
  );

  // =========================
  // ACTIONS (FAST UI UPDATE)
  // =========================
  const approve = async (id) => {
    setActionLoading(id);

    await axios.post(`${API_BASE}/api/admin/requests/${id}/approve`, {}, { headers });

    // 🔥 instant UI update (no full reload delay)
    setRequests(prev =>
      prev.map(r => r._id === id ? { ...r, status: "approved" } : r)
    );

    setActionLoading(null);
  };

  const reject = async (id) => {
    setActionLoading(id);

    await axios.post(`${API_BASE}/api/admin/requests/${id}/reject`, {}, { headers });

    setRequests(prev =>
      prev.map(r => r._id === id ? { ...r, status: "rejected" } : r)
    );

    setActionLoading(null);
  };

  const open = (r) => {
    setSelected(r);
    setNote(r.adminNotes || "");
  };

  const saveNote = async () => {
    await axios.put(
      `${API_BASE}/api/admin/requests/${selected._id}/note`,
      { note },
      { headers }
    );

    alert("Note saved");
  };

  const addComment = async () => {
    if (!comment) return;

    await axios.post(
      `${API_BASE}/api/admin/requests/${selected._id}/comment`,
      { text: comment, by: headers.email },
      { headers }
    );

    setSelected(prev => ({
      ...prev,
      comments: [...(prev.comments || []), { text: comment, by: headers.email }]
    }));

    setComment("");
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
        return "bg-gray-100";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        NIN Service Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Manage and process all customer requests
      </p>

      {/* FILTER TABS */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["pending", "approved", "completed", "rejected", "all"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === f
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-500 py-10">
          Loading requests...
        </div>
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          No requests found
        </div>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

        {filtered.map(r => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition border"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs text-gray-500">
                {r.userId?.email}
              </p>

              <span className={`text-xs px-2 py-1 rounded-full ${statusStyle(r.status)}`}>
                {r.status}
              </span>
            </div>

            {/* DETAILS */}
            <p className="font-semibold text-sm capitalize">
              {r.service} • {r.type}
            </p>

            <p className="text-sm text-gray-500">
              ₦{r.amount}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(r.createdAt).toLocaleString()}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <button
                onClick={() => open(r)}
                className="flex-1 bg-black text-white py-2 rounded-lg text-sm"
              >
                View
              </button>

              {r.status === "pending" && (
                <>
                  <button
                    onClick={() => approve(r._id)}
                    disabled={actionLoading === r._id}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                  >
                    {actionLoading === r._id ? "..." : "Approve"}
                  </button>

                  <button
                    onClick={() => reject(r._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-full max-w-2xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">
              Request Details
            </h2>

            <p><b>NIN:</b> {selected.nin}</p>
            <p><b>Type:</b> {selected.type}</p>

            {/* FORM DATA */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Form Data</h3>

              {Object.entries(selected.formData || {}).map(([k, v]) => (
                <p key={k} className="text-sm">
                  <b>{k}:</b> {v}
                </p>
              ))}
            </div>

            {/* PROOF */}
            {selected.proof && (
              <img
                src={selected.proof}
                className="w-full mt-4 rounded-lg"
              />
            )}

            {/* NOTES */}
            <div className="mt-4">
              <h3 className="font-semibold">Admin Notes</h3>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full border p-2 rounded mt-2"
              />

              <button
                onClick={saveNote}
                className="bg-blue-600 text-white px-4 py-2 mt-2 rounded"
              >
                Save Note
              </button>
            </div>

            {/* COMMENTS */}
            <div className="mt-4">
              <h3 className="font-semibold">Comments</h3>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selected.comments?.map((c, i) => (
                  <div key={i} className="bg-gray-100 p-2 rounded text-sm">
                    <b>{c.by}</b>: {c.text}
                  </div>
                ))}
              </div>

              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add comment..."
                className="w-full border p-2 mt-2 rounded"
              />

              <button
                onClick={addComment}
                className="bg-black text-white px-4 py-2 mt-2 rounded"
              >
                Send
              </button>
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-4 text-red-500"
            >
              Close
            </button>

          </div>
        </div>
      )}

    </div>
  );
}