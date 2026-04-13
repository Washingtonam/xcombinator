import { useEffect, useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function Modification() {

  const [pricing, setPricing] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    fetch(`${API}/api/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data?.ninServices?.modification || {});
      });
  }, []);

  const total = pricing?.[selectedType] || 0;

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================
  // SUBMIT
  // =========================
  const submit = async () => {
    if (!selectedType || !formData.nin) {
      return alert("Fill all required fields");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/nin-services/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: JSON.parse(localStorage.getItem("user")).id,
          service: "modification",
          type: selectedType,
          nin: formData.nin,
          slipType: "none",
          amount: total,
          proof: "manual", // 🔥 placeholder (you can upgrade later)
          formData // 🔥 FULL FORM SENT
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`Submitted successfully (₦${total})`);

      setSelectedType(null);
      setFormData({});

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  // =========================
  // SERVICE OPTIONS
  // =========================
  const services = [
    { key: "name", label: "Name Modification" },
    { key: "phone", label: "Phone Number Change" },
    { key: "address", label: "Address Correction" },
    { key: "dob", label: "Date of Birth Modification" },
  ];

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        NIN Modification
      </h1>

      {/* SELECT SERVICE */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {services.map(s => (
          <button
            key={s.key}
            onClick={() => setSelectedType(s.key)}
            className={`p-4 rounded border ${
              selectedType === s.key
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            ₦{pricing?.[s.key] || 0}
            <div className="text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {/* ========================= */}
      {/* 🔥 DYNAMIC FORM */}
      {/* ========================= */}
      {selectedType && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 space-y-3">

          {/* COMMON */}
          <input name="nin" placeholder="NIN" onChange={handleChange} className="input" />
          <input name="surname" placeholder="Surname" onChange={handleChange} className="input" />
          <input name="firstname" placeholder="First Name" onChange={handleChange} className="input" />
          <input name="middlename" placeholder="Middle Name" onChange={handleChange} className="input" />
          <input name="email" placeholder="Email" onChange={handleChange} className="input" />

          {/* ================= NAME ================= */}
          {selectedType === "name" && (
            <>
              <input name="gsm" placeholder="Phone Number" onChange={handleChange} className="input" />
              <input name="previousModification" placeholder="Previous Modification (Yes/No)" onChange={handleChange} className="input" />
            </>
          )}

          {/* ================= PHONE ================= */}
          {selectedType === "phone" && (
            <>
              <input name="oldGsm" placeholder="Old Phone" onChange={handleChange} className="input" />
              <input name="newGsm" placeholder="New Phone" onChange={handleChange} className="input" />
              <input name="previousModification" placeholder="Previous Modification (Yes/No)" onChange={handleChange} className="input" />
            </>
          )}

          {/* ================= ADDRESS ================= */}
          {selectedType === "address" && (
            <>
              <input name="address" placeholder="New Address" onChange={handleChange} className="input" />
              <input name="gsm" placeholder="Phone Number" onChange={handleChange} className="input" />
              <input name="previousModification" placeholder="Previous Modification (Yes/No)" onChange={handleChange} className="input" />
            </>
          )}

          {/* ================= DOB ================= */}
          {selectedType === "dob" && (
            <>
              <input name="gsm" placeholder="Phone" onChange={handleChange} className="input" />
              <input name="newDob" placeholder="New Date of Birth" onChange={handleChange} className="input" />
              <input name="oldDob" placeholder="Old Date of Birth" onChange={handleChange} className="input" />
              <input name="gender" placeholder="Gender" onChange={handleChange} className="input" />
              <input name="occupation" placeholder="Occupation" onChange={handleChange} className="input" />
            </>
          )}

        </div>
      )}

      {/* TOTAL */}
      {selectedType && (
        <div className="bg-gray-100 p-4 rounded mb-6">
          <p className="font-bold">Total: ₦{total}</p>
        </div>
      )}

      {/* SUBMIT */}
      {selectedType && (
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          {loading ? "Processing..." : "Submit Request"}
        </button>
      )}

    </div>
  );
}