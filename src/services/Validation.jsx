import { useEffect, useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function Validation() {
  const [pricing, setPricing] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [slip, setSlip] = useState("none");
  const [nin, setNin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/pricing`)
      .then(res => res.json())
      .then(data => setPricing(data?.ninServices?.validation || {}));
  }, []);

  const submit = async () => {
    if (!selectedService || !nin) {
      return alert("Select service and enter NIN");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/nin-services/validation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nin,
          type: selectedService,
          slip,
          userId: JSON.parse(localStorage.getItem("user")).id
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert("Submitted successfully");

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  const services = [
    { key: "noRecord", label: "No Record" },
    { key: "updateRecord", label: "Update Record" },
    { key: "validateModification", label: "Validate Modification" },
    { key: "vnin", label: "V-NIN Validation" },
    { key: "photoError", label: "Photograph Error" },
    { key: "bypass", label: "Bypass NIN" },
  ];

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Validation</h1>

      {/* SERVICES */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {services.map(s => (
          <button
            key={s.key}
            onClick={() => setSelectedService(s.key)}
            className={`p-4 rounded border ${
              selectedService === s.key
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            ₦{pricing?.[s.key] || 0}
            <div className="text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {/* SLIP */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {["none", "regular", "standard", "premium"].map(s => (
          <button
            key={s}
            onClick={() => setSlip(s)}
            className={`p-3 border rounded ${
              slip === s ? "bg-black text-white" : ""
            }`}
          >
            {s === "none" ? "₦0 - No Slip" : `₦150 - ${s}`}
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

      <button
        onClick={submit}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded"
      >
        {loading ? "Processing..." : "Submit"}
      </button>

    </div>
  );
}