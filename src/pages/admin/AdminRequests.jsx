import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminRequests() {

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");

  const [selected, setSelected] = useState(null);

  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");

  const [loadingId, setLoadingId] = useState(null);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH
  // =========================
  const fetchRequests = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/requests`, { headers });

    const sorted = res.data.sort((a, b) => {
      if (a.status === "pending") return -1;
      if (b.status === "pending") return 1;
      return 0;
    });

    setRequests(sorted);
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
  // OPEN MODAL
  // =========================
  const open = (r) => {
    setSelected(r);
    setNote(r.adminNotes || "");
  };

  // =========================
  // APPROVE
  // =========================
  const approve = async (id) => {
    setLoadingId(id);

    await axios.post(
      `${API_BASE}/api/admin/requests/${id}/approve`,
      {},
      { headers }
    );

    fetchRequests();
    setLoadingId(null);
  };

  // =========================
  // REJECT
  // =========================
  const reject = async (id) => {
    setLoadingId(id);

    await axios.post(
      `${API_BASE}/api/admin/requests/${id}/reject`,
      {},
      { headers }
    );

    fetchRequests();
    setLoadingId(null);
  };

  // =========================
  // SAVE NOTE
  // =========================
  const saveNote = async () => {
    await axios.put(
      `${API_BASE}/api/admin/requests/${selected._id}/note`,
      { note },
      { headers }
    );

    fetchRequests();
    alert("Note saved");
  };

  // =========================
  // ADD COMMENT
  // =========================
  const addComment = async () => {
    if (!comment) return;

    await axios.post(
      `${API_BASE}/api/admin/requests/${selected._id}/comment`,
      {
        text: comment,
        by: headers.email
      },
      { headers }
    );

    setComment("");
    fetchRequests();
  };

  // =========================
  // STATUS STYLE
  // =========================
  const statusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-400";
      case "approved":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-blue-600 text-white";
      default:
        return "bg-red-500 text-white";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-4">
        NIN Service Requests
      </h1>

      {/* FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "pending", "approved", "completed", "rejected"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded text-sm ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {filtered.map(r => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-xl shadow border"
          >

            {/* TOP */}
            <div className="flex justify-between mb-2">
              <p className="font-semibold text-sm">
                {r.userId?.email}
              </p>

              <span className={`text-xs px-2 py-1 rounded ${statusStyle(r.status)}`}>
                {r.status}
              </span>
            </div>

            {/* DETAILS */}
            <p className="text-sm">
              {r.service} - {r.type}
            </p>

            <p className="text-sm mb-2">
              ₦{r.amount}
            </p>

            {/* ACTION BUTTONS */}
            <div className="flex gap-2 mb-2">

              <button
                onClick={() => open(r)}
                className="flex-1 bg-black text-white py-2 rounded text-sm"
              >
                View
              </button>

              {r.status === "pending" && (
                <>
                  <button
                    onClick={() => approve(r._id)}
                    disabled={loadingId === r._id}
                    className="flex-1 bg-green-600 text-white py-2 rounded text-sm"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => reject(r._id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded text-sm"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>

          </div>
        ))}

      </div>

      {/* ================= MODAL ================= */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

          <div className="bg-white w-full max-w-2xl p-6 rounded-xl max-h-[90vh] overflow-y-auto">

            <h2 className="text-xl font-bold mb-4">
              Full Request Details
            </h2>

            <p><b>NIN:</b> {selected.nin}</p>
            <p><b>Type:</b> {selected.type}</p>

            {/* FORM DATA */}
            <div className="mt-4">
              <h3 className="font-semibold">Form Data</h3>

              {selected.formData &&
                Object.entries(selected.formData).map(([k, v]) => (
                  <p key={k}><b>{k}:</b> {v}</p>
                ))
              }
            </div>

            {/* PROOF */}
            {selected.proof && (
              <img
                src={selected.proof}
                className="w-full mt-4 rounded"
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