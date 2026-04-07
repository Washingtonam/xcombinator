import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPricing() {
  const [unitPrice, setUnitPrice] = useState("");
  const [agentPrice, setAgentPrice] = useState("");
  const [mode, setMode] = useState("bundle");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH PRICING
  // =========================
  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/pricing`);

      const nin = res.data?.nin || {};

      setUnitPrice(nin.unitPrice || 250);
      setAgentPrice(nin.agentPrice || 150);
      setMode(nin.mode || "bundle");

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
  // UPDATE PRICING
  // =========================
  const handleUpdate = async () => {
    if (!unitPrice || !agentPrice) {
      return alert("All fields are required");
    }

    setLoading(true);
    setSuccess(false);

    try {
      await axios.put(
        `${API_BASE}/api/admin/pricing`,
        {
          unitPrice: Number(unitPrice),
          agentPrice: Number(agentPrice),
          mode,
        },
        { headers }
      );

      setSuccess(true);
      await fetchPricing();

    } catch (err) {
      console.error(err);
      alert("Update failed");
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading pricing...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl shadow-lg">

      {/* HEADER */}
      <h2 className="text-2xl font-bold mb-2 dark:text-white">
        Unit Pricing Control
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Control how users are charged for verification.
      </p>

      {/* UNIT PRICE */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Price Per Unit (₦)
        </label>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className="w-full border p-3 rounded-xl mt-1"
        />
      </div>

      {/* AGENT PRICE */}
      <div className="mb-4">
        <label className="text-sm text-gray-600 dark:text-gray-300">
          Agent Price (₦)
        </label>
        <input
          type="number"
          value={agentPrice}
          onChange={(e) => setAgentPrice(e.target.value)}
          className="w-full border p-3 rounded-xl mt-1"
        />
      </div>

      {/* MODE */}
      <div className="mb-4">
        <label className="text-sm font-semibold dark:text-white">
          Pricing Mode
        </label>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="w-full border p-3 rounded-xl mt-1"
        >
          <option value="bundle">Bundle (1 Unit = All Slips)</option>
          <option value="single">Single (1 Unit = 1 Slip)</option>
        </select>
      </div>

      {/* SUMMARY */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-[#111] rounded-xl text-sm">
        <p>💡 System Behavior:</p>

        {mode === "bundle" ? (
          <p>• 1 Unit unlocks ALL slips</p>
        ) : (
          <p>• 1 Unit per slip</p>
        )}

        <p>• User Price: ₦{unitPrice}</p>
        <p>• Agent Price: ₦{agentPrice}</p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full mt-6 py-3 rounded-xl text-white ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Updating..." : "Save Settings"}
      </button>

      {/* SUCCESS */}
      {success && (
        <div className="mt-4 text-green-600 text-center text-sm">
          ✅ Settings updated successfully
        </div>
      )}

    </div>
  );
}