import { useState } from "react";
import { useUser } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";

export default function VerifyNIN() {
  const { user, units, setUnits } = useUser();
  const navigate = useNavigate();

  const [method, setMethod] = useState("nin");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("bundle");

  const [nin, setNin] = useState("");
  const [phone, setPhone] = useState("");
  const [trackingId, setTrackingId] = useState("");

  const [form, setForm] = useState({
    firstname: "",
    surname: "",
    gender: "",
    birthdate: "",
  });

  // =========================
  // 🔥 UNIT DISPLAY
  // =========================
  const unitsRequired =
    method === "phone" || method === "demographic" ? 2 : 1;

  // =========================
  // VERIFY
  // =========================
  const handleVerify = async () => {
    if (loading) return;

    // =========================
    // VALIDATION
    // =========================
    if (method === "nin" && nin.length !== 11) {
      return alert("Enter valid 11-digit NIN");
    }

    if (method === "phone" && phone.length < 10) {
      return alert("Enter valid phone number");
    }

    if (method === "tracking" && !trackingId) {
      return alert("Enter tracking ID");
    }

    if (method === "demographic") {
      if (!form.firstname || !form.surname || !form.gender || !form.birthdate) {
        return alert("Complete all demographic fields");
      }
    }

    const isAdmin =
      user?.email?.toLowerCase().trim() === "washingtonamedu@gmail.com";

    if (!isAdmin && units < unitsRequired) {
      return alert(`This action requires ${unitsRequired} units`);
    }

    setLoading(true);

    try {
      // Wake server
      await fetch("https://xcombinator.onrender.com/api/pricing");

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      // =========================
      // 🔥 BUILD PAYLOAD
      // =========================
      let payloadData = {};

      if (method === "nin") {
        payloadData = { nin };
      }

      if (method === "phone") {
        payloadData = { phone };
      }

      if (method === "tracking") {
        payloadData = { tracking_id: trackingId };
      }

      if (method === "demographic") {
        payloadData = {
          firstname: form.firstname,
          lastname: form.surname,
          gender: form.gender.toLowerCase(),
          dob: form.birthdate,
        };
      }

      const res = await fetch(
        "https://xcombinator.onrender.com/api/verify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            method,
            data: payloadData,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // =========================
      // SUCCESS
      // =========================
      setUnits(data.units);
      setMode(data.mode || "bundle");

      localStorage.setItem("nin_result", JSON.stringify(data));

      navigate("/verify-result");

    } catch (err) {
      console.error(err);

      if (err.name === "AbortError") {
        alert("⏳ Server timeout. Try again.");
      } else {
        alert(err.message || "Verification failed");
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">Verify Identity</h1>

      <p className="text-gray-500 mb-6">
        {mode === "bundle"
          ? "Use units to unlock verification"
          : "Pay per verification"}
      </p>

      {/* BALANCE */}
      <div className="bg-black text-white p-4 rounded-lg mb-4">
        Units Available: <b>{units}</b>
      </div>

      {/* 🔥 COST DISPLAY */}
      <div className="bg-blue-50 text-blue-700 p-3 rounded mb-6 text-sm">
        This verification will cost <b>{unitsRequired} unit(s)</b>
      </div>

      {/* METHOD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { key: "nin", label: "NIN" },
          { key: "phone", label: "Phone" },
          { key: "demographic", label: "Demographic" },
          { key: "tracking", label: "Tracking ID" },
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

      {/* INPUT */}
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

        {method === "tracking" && (
          <input
            type="text"
            placeholder="Enter Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="w-full border p-3 rounded"
          />
        )}

        {method === "demographic" && (
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
              <option value="male">Male</option>
              <option value="female">Female</option>
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

      {/* BUTTON */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded-lg"
      >
        {loading ? "Verifying... ⏳" : `Verify (${unitsRequired} unit${unitsRequired > 1 ? "s" : ""})`}
      </button>

      {/* LOADING */}
      {loading && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          🔍 Connecting to server...
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