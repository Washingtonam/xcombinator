import { useEffect, useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function Validation() {

  const [pricing, setPricing] = useState({});
  const [slipPrice, setSlipPrice] = useState(150);

  const [selectedService, setSelectedService] = useState(null);
  const [slip, setSlip] = useState("none");
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
        setPricing(data?.ninServices?.validation || {});
        setSlipPrice(data?.ninServices?.slipPrice || 150);
      });
  }, []);

  // =========================
  // CALCULATE TOTAL
  // =========================
  const basePrice = pricing?.[selectedService] || 0;
  const extraSlip = slip === "none" ? 0 : slipPrice;
  const total = basePrice + extraSlip;

  // =========================
  // HANDLE FILE
  // =========================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  // =========================
  // SUBMIT (PAYMENT FLOW)
  // =========================
  const submit = async () => {
    if (!selectedService || !nin) {
      return alert("Select service and enter NIN");
    }

    if (!proof) {
      return alert("Upload payment proof");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/submit-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: JSON.parse(localStorage.getItem("user")).id,
          amount: total,
          proof,

          // 🔥 SERVICE DATA
          type: "SERVICE",
          service: "validation",
          serviceType: selectedService,
          nin,
          slipType: slip,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      alert(`✅ Payment submitted! Await admin approval`);

      // RESET
      setSelectedService(null);
      setSlip("none");
      setNin("");
      setProof(null);

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
            <div className="font-semibold">
              ₦{pricing?.[s.key] || 0}
            </div>
            <div className="text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {/* SLIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {["none", "regular", "standard", "premium"].map(s => (
          <button
            key={s}
            onClick={() => setSlip(s)}
            className={`p-3 border rounded ${
              slip === s ? "bg-black text-white" : ""
            }`}
          >
            {s === "none"
              ? "₦0 - No Slip"
              : `₦${slipPrice} - ${s}`}
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
        <p>Service: ₦{basePrice}</p>
        <p>Slip: ₦{extraSlip}</p>
        <p className="font-bold mt-2">
          Total: ₦{total}
        </p>
      </div>

      {/* BANK DETAILS */}
      <div className="bg-yellow-50 p-4 rounded mb-4 text-sm">
        <p><b>Bank:</b> Moniepoint</p>
        <p><b>Account Number:</b> 8161495298</p>
        <p><b>Account Name:</b> Steve Computer Warehouse Limited</p>
      </div>

      {/* UPLOAD */}
      <input type="file" onChange={handleFile} className="mb-4" />

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