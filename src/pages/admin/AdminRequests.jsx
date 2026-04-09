import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);

  // 🔥 store file per request (NOT global)
  const [files, setFiles] = useState({});

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH REQUESTS
  // =========================
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/admin/requests`,
        { headers }
      );

      const sorted = res.data.sort((a, b) => {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        return 0;
      });

      setRequests(sorted);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // APPROVE
  // =========================
  const approve = async (id) => {
    setLoadingId(id);

    try {
      await axios.post(
        `${API_BASE}/api/admin/requests/${id}/approve`,
        {},
        { headers }
      );

      fetchRequests();
    } catch (err) {
      console.error(err);
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
        `${API_BASE}/api/admin/requests/${id}/reject`,
        {},
        { headers }
      );

      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Rejection failed");
    }

    setLoadingId(null);
  };

  // =========================
  // HANDLE FILE (PER CARD)
  // =========================
  const handleFile = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🔥 VALIDATE TYPE
    if (file.type !== "application/pdf") {
      return alert("Only PDF allowed");
    }

    // 🔥 VALIDATE SIZE (~2MB)
    if (file.size > 2 * 1024 * 1024) {
      return alert("File too large (max 2MB)");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFiles((prev) => ({
        ...prev,
        [id]: {
          data: reader.result,
          name: file.name,
        },
      }));
    };
  };

  // =========================
  // UPLOAD SLIP
  // =========================
  const uploadSlip = async (id) => {
    if (!files[id]) {
      return alert("Select a PDF first");
    }

    setLoadingId(id);

    try {
      await axios.post(
        `${API_BASE}/api/admin/requests/${id}/upload-slip`,
        { pdf: files[id].data },
        { headers }
      );

      // 🔥 CLEAR FILE AFTER UPLOAD
      setFiles((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });

      fetchRequests();

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setLoadingId(null);
  };

  // =========================
  // FILTER
  // =========================
  const filtered = requests.filter((r) => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        NIN Service Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Manage validation, IPE & modification jobs
      </p>

      {/* FILTER */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {["all", "pending", "approved", "rejected", "completed"].map((f) => (
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
      {filtered.length === 0 && (
        <p className="text-gray-500">No requests found</p>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">

        {filtered.map((r) => (
          <div
            key={r._id}
            className="bg-white p-5 rounded-xl shadow border"
          >

            {/* TOP */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm">
                {r.userId?.email}
              </p>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  r.status === "pending"
                    ? "bg-yellow-400"
                    : r.status === "approved"
                    ? "bg-green-500 text-white"
                    : r.status === "completed"
                    ? "bg-blue-600 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {r.status}
              </span>
            </div>

            {/* DETAILS */}
            <div className="text-sm space-y-1 mb-3">
              <p><b>Service:</b> {r.service}</p>
              <p><b>Type:</b> {r.type}</p>
              <p><b>NIN:</b> {r.nin}</p>
              <p><b>Slip:</b> {r.slipType}</p>
              <p><b>Amount:</b> ₦{r.amount}</p>
            </div>

            {/* PROOF */}
            {r.proof && (
              <img
                src={r.proof}
                alt="proof"
                className="w-full h-40 object-cover rounded mb-3"
              />
            )}

            {/* PENDING ACTION */}
            {r.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(r._id)}
                  disabled={loadingId === r._id}
                  className={`flex-1 py-2 rounded text-white text-sm ${
                    loadingId === r._id
                      ? "bg-gray-400"
                      : "bg-green-600"
                  }`}
                >
                  {loadingId === r._id ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => reject(r._id)}
                  disabled={loadingId === r._id}
                  className="flex-1 py-2 rounded bg-red-600 text-white text-sm"
                >
                  Reject
                </button>
              </div>
            )}

            {/* APPROVED → UPLOAD */}
            {r.status === "approved" && (
              <div className="mt-3">

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFile(e, r._id)}
                  className="mb-2"
                />

                {files[r._id] && (
                  <p className="text-xs text-gray-500 mb-2">
                    Selected: {files[r._id].name}
                  </p>
                )}

                <button
                  onClick={() => uploadSlip(r._id)}
                  disabled={loadingId === r._id}
                  className={`w-full py-2 rounded text-white ${
                    loadingId === r._id
                      ? "bg-gray-400"
                      : "bg-blue-600"
                  }`}
                >
                  {loadingId === r._id ? "Uploading..." : "Upload Slip"}
                </button>

              </div>
            )}

            {/* COMPLETED */}
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