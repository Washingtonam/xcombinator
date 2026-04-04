import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPricing() {
  const [dataPrice, setDataPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [longPrice, setLongPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  const headers = {
    email: localStorage.getItem("email"),
  };

  // =========================
  // FETCH CURRENT PRICING
  // =========================
  const fetchPricing = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/pricing`);

      setDataPrice(res.data.nin.data);
      setPremiumPrice(res.data.nin.premium);
      setLongPrice(res.data.nin.long);

    } catch (err) {
      console.error("Pricing fetch error:", err);
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
    if (!dataPrice || !premiumPrice || !longPrice) {
      return alert("All fields are required");
    }

    setLoading(true);
    setSuccess(false);

    try {
      await axios.put(
        `${API_BASE}/api/admin/pricing`,
        {
          dataPrice: Number(dataPrice),
          premiumPrice: Number(premiumPrice),
          longPrice: Number(longPrice),
        },
        { headers }
      );

      setSuccess(true);

      // 🔥 REFETCH AFTER UPDATE (FIXES RESET ISSUE)
      await fetchPricing();

    } catch (err) {
      console.error(err);
      alert("Update failed. Check server.");
    }

    setLoading(false);
  };

  // =========================
  // UI
  // =========================
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
        NIN Slip Pricing
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        Update pricing for all slip types. Changes apply instantly.
      </p>

      {/* ========================= */}
      {/* INPUTS */}
      {/* ========================= */}
      <div className="space-y-4">

        {/* DATA */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Data Slip Price (₦)
          </label>
          <input
            type="number"
            value={dataPrice}
            onChange={(e) => setDataPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* PREMIUM */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Premium Slip Price (₦)
          </label>
          <input
            type="number"
            value={premiumPrice}
            onChange={(e) => setPremiumPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* LONG */}
        <div>
          <label className="text-sm text-gray-600 dark:text-gray-300">
            Long Slip Price (₦)
          </label>
          <input
            type="number"
            value={longPrice}
            onChange={(e) => setLongPrice(e.target.value)}
            className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

      </div>

      {/* ========================= */}
      {/* SUMMARY */}
      {/* ========================= */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-[#111] rounded-xl text-sm text-gray-600 dark:text-gray-400">
        <p>💡 Pricing Summary:</p>
        <p>• Data: ₦{dataPrice}</p>
        <p>• Premium: ₦{premiumPrice}</p>
        <p>• Long: ₦{longPrice}</p>
      </div>

      {/* ========================= */}
      {/* BUTTON */}
      {/* ========================= */}
      <button
        onClick={handleUpdate}
        disabled={loading}
        className={`w-full mt-6 py-3 rounded-xl text-white font-semibold ${
          loading
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Updating..." : "Save Pricing"}
      </button>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="mt-4 text-green-600 text-center text-sm">
          ✅ Pricing updated successfully
        </div>
      )}

    </div>
  );
}