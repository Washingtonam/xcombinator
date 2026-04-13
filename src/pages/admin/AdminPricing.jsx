import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPricing() {

  const headers = {
    email: localStorage.getItem("email"),
  };

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // =========================
  // 🟦 UNIT PRICING
  // =========================
  const [unitPrice, setUnitPrice] = useState("");
  const [agentPrice, setAgentPrice] = useState("");
  const [mode, setMode] = useState("bundle");

  // =========================
  // 🟩 VALIDATION
  // =========================
  const [validation, setValidation] = useState({
    noRecord: 1000,
    updateRecord: 1150,
    validateModification: 1150,
    vnin: 1000,
    photoError: 1150,
    bypass: 1150,
    slipPrice: 150
  });

  // =========================
  // 🟨 IPE
  // =========================
  const [ipe, setIpe] = useState({
    inProcessingError: 1000,
    stillProcessing: 1000,
    newEnrollment: 1000,
    invalidTracking: 1000
  });

  // =========================
  // 🟥 MODIFICATION
  // =========================
  const [modification, setModification] = useState({
    name: 12000,
    phone: 12000,
    address: 12000,
    dob: 50000
  });

  // =========================
  // FETCH (FIXED)
  // =========================
  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/pricing`);
      const data = res.data;

      setUnitPrice(data?.nin?.unitPrice ?? 250);
      setAgentPrice(data?.nin?.agentPrice ?? 150);
      setMode(data?.nin?.mode ?? "bundle");

      setValidation({
        noRecord: data?.ninServices?.validation?.noRecord ?? 1000,
        updateRecord: data?.ninServices?.validation?.updateRecord ?? 1150,
        validateModification: data?.ninServices?.validation?.validateModification ?? 1150,
        vnin: data?.ninServices?.validation?.vnin ?? 1000,
        photoError: data?.ninServices?.validation?.photoError ?? 1150,
        bypass: data?.ninServices?.validation?.bypass ?? 1150,
        slipPrice: data?.ninServices?.slipPrice ?? 150
      });

      setIpe({
        inProcessingError: data?.ninServices?.ipe?.inProcessingError ?? 1000,
        stillProcessing: data?.ninServices?.ipe?.stillProcessing ?? 1000,
        newEnrollment: data?.ninServices?.ipe?.newEnrollment ?? 1000,
        invalidTracking: data?.ninServices?.ipe?.invalidTracking ?? 1000
      });

      setModification({
        name: data?.ninServices?.modification?.name ?? 12000,
        phone: data?.ninServices?.modification?.phone ?? 12000,
        address: data?.ninServices?.modification?.address ?? 12000,
        dob: data?.ninServices?.modification?.dob ?? 50000
      });

    } catch (err) {
      console.error(err);
      alert("Failed to load pricing");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  // =========================
  // 🔥 SAVE
  // =========================
  const saveSection = async (payload) => {
    setLoading(true);

    try {
      await axios.put(`${API_BASE}/api/admin/pricing`, payload, { headers });
      alert("Updated successfully");
      fetchPricing();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }

    setLoading(false);
  };

  if (fetching) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* ================= UNIT ================= */}
      <Section title="Unit Pricing">
        <Input label="Unit Price" value={unitPrice} set={setUnitPrice} />
        <Input label="Agent Price" value={agentPrice} set={setAgentPrice} />

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="bundle">Bundle</option>
          <option value="single">Single</option>
        </select>

        <Button
          onClick={() =>
            saveSection({
              unitPrice: Number(unitPrice),
              agentPrice: Number(agentPrice),
              mode
            })
          }
          loading={loading}
        />
      </Section>

      {/* ================= VALIDATION ================= */}
      <Section title="Validation Pricing">
        {Object.keys(validation).map((key) => (
          <Input
            key={key}
            label={key}
            value={validation[key]}
            set={(val) => setValidation({ ...validation, [key]: val })}
          />
        ))}

        <Button
          onClick={() => {
            const { slipPrice, ...validationData } = validation;

            saveSection({
              validation: validationData,
              slipPrice: Number(slipPrice)
            });
          }}
          loading={loading}
        />
      </Section>

      {/* ================= IPE ================= */}
      <Section title="IPE Pricing">
        {Object.keys(ipe).map((key) => (
          <Input
            key={key}
            label={key}
            value={ipe[key]}
            set={(val) => setIpe({ ...ipe, [key]: val })}
          />
        ))}

        <Button
          onClick={() =>
            saveSection({
              ipe
            })
          }
          loading={loading}
        />
      </Section>

      {/* ================= MODIFICATION ================= */}
      <Section title="Modification Pricing">
        {Object.keys(modification).map((key) => (
          <Input
            key={key}
            label={key}
            value={modification[key]}
            set={(val) => setModification({ ...modification, [key]: val })}
          />
        ))}

        <Button
          onClick={() =>
            saveSection({
              modification
            })
          }
          loading={loading}
        />
      </Section>

    </div>
  );
}

// =========================
// UI COMPONENTS
// =========================
function Section({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, value, set }) {
  return (
    <div>
      <label className="text-sm capitalize">{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => set(e.target.value)}
        className="w-full border p-2 rounded"
      />
    </div>
  );
}

function Button({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded mt-3"
    >
      {loading ? "Saving..." : "Save"}
    </button>
  );
}