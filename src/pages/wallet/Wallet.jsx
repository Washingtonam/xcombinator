import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

const API_BASE = "https://xcombinator.onrender.com";

export default function Wallet() {
  const { user, units } = useUser();

  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unitPrice, setUnitPrice] = useState(250);

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pricing`);
        const data = await res.json();

        setUnitPrice(data?.nin?.unitPrice || 250);
      } catch (err) {
        console.error("Pricing fetch error:", err);
      }
    };

    fetchPricing();
  }, []);

  // =========================
  // CALCULATE UNITS
  // =========================
  const calculatedUnits = Math.floor(Number(amount) / unitPrice);

  // =========================
  // HANDLE FILE (SAFE VERSION 🔥)
  // =========================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 🔥 LIMIT SIZE (VERY IMPORTANT)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image too large. Max 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  // =========================
  // SUBMIT PAYMENT (UPGRADED 🔥)
  // =========================
  const submitPayment = async () => {
    if (!user?.id) {
      return alert("User not logged in");
    }

    if (!amount || Number(amount) <= 0) {
      return alert("Enter a valid amount");
    }

    if (!proof) {
      return alert("Upload payment proof");
    }

    if (calculatedUnits < 1) {
      return alert(`Minimum is ₦${unitPrice} (1 unit)`);
    }

    setLoading(true);

    try {
      console.log("🚀 SENDING PAYMENT:", {
        userId: user.id,
        amount,
        units: calculatedUnits,
      });

      const res = await fetch(`${API_BASE}/api/submit-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          units: calculatedUnits,
          proof,
        }),
      });

      const data = await res.json();

      console.log("📦 RESPONSE:", data);

      if (!res.ok) {
        throw new Error(data.message || "Payment failed");
      }

      alert(`✅ Submitted! You’ll receive ${calculatedUnits} units after approval`);

      // RESET
      setAmount("");
      setProof(null);

    } catch (error) {
      console.error("❌ PAYMENT ERROR:", error.message);

      // 🔥 SHOW REAL ERROR (NOT GENERIC)
      alert(error.message || "Submission failed");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">Wallet</h1>
      <p className="text-gray-500 mb-6">
        Fund your account and convert to units
      </p>

      {/* UNITS */}
      <div className="bg-black text-white p-4 rounded-lg mb-6">
        Units Available: <b>{units}</b>
      </div>

      {/* PRICE */}
      <div className="bg-gray-100 p-4 rounded mb-6 text-sm">
        💰 Price per unit: <b>₦{unitPrice}</b>
      </div>

      {/* CARD */}
      <div className="bg-white p-6 rounded-xl shadow">

        <h2 className="font-semibold mb-3">Manual Bank Transfer</h2>

        <div className="bg-gray-100 p-4 rounded text-sm space-y-1">
          <p><b>Bank:</b> Moniepoint</p>
          <p><b>Account Number:</b> 8161495298</p>
          <p><b>Account Name:</b> Steve Computer Warehouse Limited</p>
        </div>

        {/* AMOUNT */}
        <input
          type="number"
          placeholder="Enter amount (₦)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 mt-4 rounded"
        />

        {/* CALC */}
        {amount && (
          <div className="mt-3 text-sm bg-blue-50 p-3 rounded">
            <p>💱 ₦{amount} ÷ ₦{unitPrice}</p>
            <p className="font-semibold text-blue-700">
              = {calculatedUnits} units
            </p>
          </div>
        )}

        {/* FILE */}
        <input type="file" onChange={handleFile} className="mt-4" />

        {/* BUTTON */}
        <button
          onClick={submitPayment}
          disabled={loading}
          className={`w-full mt-5 py-3 rounded text-white font-medium ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>

        <p className="text-xs text-gray-500 mt-4">
          ⚠️ Payments are reviewed before units are credited.
        </p>

      </div>

    </div>
  );
}