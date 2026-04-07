import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function VerifyNIN() {
  const { user, units, setUnits } = useUser();

  const [method, setMethod] = useState("nin");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState("bundle"); // 🔥 NEW

  // INPUT STATES
  const [nin, setNin] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlip, setSelectedSlip] = useState("data"); // 🔥 FOR SINGLE MODE

  const [form, setForm] = useState({
    firstname: "",
    surname: "",
    gender: "",
    birthdate: "",
  });

  // =========================
  // VERIFY FUNCTION
  // =========================
  const handleVerify = async () => {
    if (loading) return;

    if (method === "nin" && nin.length !== 11) {
      return alert("Enter valid 11-digit NIN");
    }

    if (method === "phone" && phone.length < 10) {
      return alert("Enter valid phone number");
    }

    if (method === "demo") {
      if (!form.firstname || !form.surname || !form.gender || !form.birthdate) {
        return alert("Complete all demographic fields");
      }
    }

    if (units < 1) {
      return alert("Insufficient units. Please fund wallet.");
    }

    setLoading(true);

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/verify-nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method,
          nin,
          phone,
          ...form,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setResult(data);
      setUnits(data.units);
      setMode(data.mode || "bundle"); // 🔥 GET MODE

    } catch (err) {
      console.error(err);
      alert("Server error");
    }

    setLoading(false);
  };

  // =========================
  // DOWNLOAD
  // =========================
  const downloadSlip = async (type) => {
    const info = result?.data?.data || result?.data;
    if (!info) return alert("No data available");

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/generate-nin-slip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: info,
          type,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-slip.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">Verify Identity</h1>

      <p className="text-gray-500 mb-6">
        {mode === "bundle"
          ? "Use 1 unit to unlock all NIN slips"
          : "Use 1 unit per slip generation"}
      </p>

      {/* BALANCE */}
      <div className="bg-black text-white p-4 rounded-lg mb-6">
        Units Available: <b>{units}</b>
      </div>

      {/* METHOD SELECT */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: "nin", label: "NIN" },
          { key: "phone", label: "Phone" },
          { key: "demo", label: "Demographic" },
        ].map((m) => (
          <div
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={`p-3 rounded-lg border cursor-pointer text-center ${
              method === m.key
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            {m.label}
          </div>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="mb-6">

        {method === "nin" && (
          <input
            type="text"
            placeholder="Enter 11-digit NIN"
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            className="w-full border p-3 rounded"
          />
        )}

        {method === "phone" && (
          <input
            type="text"
            placeholder="Enter Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded"
          />
        )}

        {method === "demo" && (
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="First Name"
              onChange={(e) =>
                setForm({ ...form, firstname: e.target.value })
              }
              className="border p-3 rounded"
            />

            <input
              placeholder="Surname"
              onChange={(e) =>
                setForm({ ...form, surname: e.target.value })
              }
              className="border p-3 rounded"
            />

            <select
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="border p-3 rounded"
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
            </select>

            <input
              type="date"
              onChange={(e) =>
                setForm({ ...form, birthdate: e.target.value })
              }
              className="border p-3 rounded"
            />
          </div>
        )}
      </div>

      {/* 🔥 SINGLE MODE SLIP SELECT */}
      {mode === "single" && (
        <div className="mb-4">
          <p className="text-sm mb-2">Select Slip Type</p>
          <div className="grid grid-cols-3 gap-3">
            {["data", "premium", "long"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedSlip(type)}
                className={`p-2 rounded border ${
                  selectedSlip === type
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* COST */}
      <div className="mb-4 text-sm text-gray-600">
        Cost: <b>1 Unit</b>
      </div>

      {/* VERIFY BUTTON */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        {loading
          ? "Processing..."
          : mode === "bundle"
          ? "Verify & Unlock All Slips"
          : "Verify"}
      </button>

      {/* RESULT */}
      {result && (
        <div className="mt-8">

          <h2 className="font-semibold mb-3">
            {mode === "bundle"
              ? "Download All Slips"
              : "Download Selected Slip"}
          </h2>

          {mode === "bundle" ? (
            <div className="grid grid-cols-3 gap-3">
              {["data", "premium", "long"].map((type) => (
                <button
                  key={type}
                  onClick={() => downloadSlip(type)}
                  className="bg-blue-600 text-white py-2 rounded"
                >
                  {type}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => downloadSlip(selectedSlip)}
              className="bg-blue-600 text-white py-3 rounded w-full"
            >
              Download {selectedSlip} slip
            </button>
          )}

        </div>
      )}

      {/* TRUST */}
      <div className="mt-10 text-xs text-gray-500 space-y-2">
        <p>✔ Secure verification</p>
        <p>✔ User consent required</p>
        <p>✔ Not affiliated with NIMC</p>
      </div>

    </div>
  );
}