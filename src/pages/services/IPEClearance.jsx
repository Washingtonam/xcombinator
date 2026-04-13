import { useEffect, useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function IPEClearance() {

  const [pricing, setPricing] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [nin, setNin] = useState("");
  const [proof, setProof] = useState(null);

  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    fetch(`${API}/api/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data?.ninServices?.ipe || {});
      });
  }, []);

  // =========================
  // TOTAL
  // =========================
  const total = pricing?.[selectedType] || 0;

  // =========================
  // HANDLE FILE (VALIDATED)
  // =========================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("File too large (max 2MB)");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  // =========================
  // SUBMIT (LOCKED PAYMENT FLOW)
  // =========================
  const submit = async () => {
    if (!selectedType || !nin) {
      return alert("Select issue type and enter NIN");
    }

    if (!proof) {
      return alert("Upload payment proof");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/nin-services/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: JSON.parse(localStorage.getItem("user")).id,
          service: "ipe",
          type: selectedType,
          nin,
          slipType: "none", // 🔥 no slip here
          proof
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("✅ Payment submitted. Await admin approval.");

      // RESET
      setSelectedType(null);
      setNin("");
      setProof(null);

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  const services = [
    { key: "inProcessingError", label: "In Processing Error" },
    { key: "stillProcessing", label: "Still Processing" },
    { key: "newEnrollment", label: "New Enrollment (Tracking ID)" },
    { key: "invalidTracking", label: "Invalid Tracking ID" },
  ];

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-2">
        IPE Clearance
      </h1>

      <p className="text-gray-500 mb-6">
        Resolve enrollment and tracking-related issues
      </p>

      {/* SERVICES */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {services.map(s => (
          <button
            key={s.key}
            onClick={() => setSelectedType(s.key)}
            className={`p-4 rounded border transition ${
              selectedType === s.key
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <div className="font-semibold">
              ₦{pricing?.[s.key] || 0}
            </div>
            <div className="text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Enter NIN"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      />

      {/* TOTAL */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-bold">Total: ₦{total}</p>
      </div>

      {/* BANK DETAILS */}
      <div className="bg-yellow-50 p-4 rounded mb-4 text-sm">
        <p><b>Bank:</b> OPAY</p>
        <p><b>Account Number:</b> 6104102697</p>
        <p><b>Account Name:</b> WASHINGTON AMEDU</p>
      </div>

      {/* FILE */}
      <input
        type="file"
        accept="image/*,application/pdf"
        onChange={handleFile}
        className="mb-4"
      />

      {/* BUTTON */}
      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded w-full"
      >
        {loading ? "Submitting..." : "Submit Payment"}
      </button>

    </div>
  );
}