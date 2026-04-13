import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminRequests() {

  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loadingId, setLoadingId] = useState(null);
  const [files, setFiles] = useState({});

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH
  // =========================
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/admin/requests`, { headers });

      const sorted = res.data.sort((a, b) => {
        if (a.status === "pending") return -1;
        if (b.status === "pending") return 1;
        return 0;
      });

      setRequests(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // =========================
  // ACTIONS
  // =========================
  const approve = async (id) => {
    setLoadingId(id);
    try {
      await axios.post(`${API_BASE}/api/admin/requests/${id}/approve`, {}, { headers });
      fetchRequests();
    } catch {
      alert("Approval failed");
    }
    setLoadingId(null);
  };

  const reject = async (id) => {
    setLoadingId(id);
    try {
      await axios.post(`${API_BASE}/api/admin/requests/${id}/reject`, {}, { headers });
      fetchRequests();
    } catch {
      alert("Rejection failed");
    }
    setLoadingId(null);
  };

  // =========================
  // FILE HANDLING
  // =========================
  const handleFile = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      return alert("Only PDF allowed");
    }

    if (file.size > 2 * 1024 * 1024) {
      return alert("Max size is 2MB");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setFiles(prev => ({
        ...prev,
        [id]: {
          data: reader.result,
          name: file.name,
        },
      }));
    };
  };

  const uploadSlip = async (id) => {
    if (!files[id]) return alert("Select PDF first");

    setLoadingId(id);

    try {
      await axios.post(
        `${API_BASE}/api/admin/requests/${id}/upload-slip`,
        { pdf: files[id].data },
        { headers }
      );

      // clear file
      setFiles(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });

      fetchRequests();

    } catch {
      alert("Upload failed");
    }

    setLoadingId(null);
  };

  // =========================
  // FILTER
  // =========================
  const filtered = requests.filter(r =>
    filter === "all" ? true : r.status === filter
  );

  // =========================
  // HELPERS
  // =========================
  const serviceStyle = (service) => {
    switch (service) {
      case "validation":
        return "bg-blue-100 text-blue-700";
      case "ipe":
        return "bg-purple-100 text-purple-700";
      case "modification":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100";
    }
  };

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

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        NIN Service Requests
      </h1>

      <p className="text-gray-500 mb-6">
        Payment → Approval → Processing → Delivery
      </p>

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
          <div key={r._id} className="bg-white p-5 rounded-xl shadow border">

            {/* TOP */}
            <div className="flex justify-between items-center mb-2">
              <p className="font-semibold text-sm">
                {r.userId?.email}
              </p>

              <span className={`text-xs px-2 py-1 rounded ${statusStyle(r.status)}`}>
                {r.status}
              </span>
            </div>

            {/* SERVICE BADGE */}
            <div className={`inline-block px-3 py-1 text-xs rounded mb-2 ${serviceStyle(r.service)}`}>
              {r.service?.toUpperCase()}
            </div>

            {/* DETAILS */}
            <div className="text-sm space-y-1 mb-3">
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

            {/* PENDING */}
            {r.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={() => approve(r._id)}
                  disabled={loadingId === r._id}
                  className="flex-1 py-2 rounded bg-green-600 text-white"
                >
                  {loadingId === r._id ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={() => reject(r._id)}
                  disabled={loadingId === r._id}
                  className="flex-1 py-2 rounded bg-red-600 text-white"
                >
                  Reject
                </button>
              </div>
            )}

            {/* APPROVED */}
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
                    📄 {files[r._id].name}
                  </p>
                )}

                <button
                  onClick={() => uploadSlip(r._id)}
                  disabled={loadingId === r._id}
                  className="w-full py-2 rounded bg-blue-600 text-white"
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