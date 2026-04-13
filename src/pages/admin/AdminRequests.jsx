import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminRequests() {

  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);

  const [note, setNote] = useState("");
  const [comment, setComment] = useState("");

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH
  // =========================
  const fetchRequests = async () => {
    const res = await axios.get(`${API_BASE}/api/admin/requests`, { headers });
    setRequests(res.data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // OPEN MODAL
  // =========================
  const open = (r) => {
    setSelected(r);
    setNote(r.adminNotes || "");
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

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Requests
      </h1>

      <div className="grid md:grid-cols-2 gap-4">

        {requests.map(r => (
          <div
            key={r._id}
            onClick={() => open(r)}
            className="p-4 border rounded cursor-pointer hover:shadow"
          >
            <p className="font-semibold">{r.userId?.email}</p>
            <p>{r.service} - {r.type}</p>
            <p>₦{r.amount}</p>
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

            {/* BASIC */}
            <p><b>NIN:</b> {selected.nin}</p>
            <p><b>Type:</b> {selected.type}</p>

            {/* 🔥 FORM DATA */}
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

            {/* CLOSE */}
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