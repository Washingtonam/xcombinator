import { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";

export default function VerifyNIN() {
  const [nin, setNin] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [prices, setPrices] = useState({
    data: 350,
    premium: 450,
    long: 400,
  });

  const { user, balance, setBalance } = useUser();

  // =========================
  // FETCH PRICING (OPTIONAL EXTENSION)
  // =========================
  useEffect(() => {
    fetch("https://xcombinator.onrender.com/api/pricing")
      .then(res => res.json())
      .then(data => {
        setPrices({
          data: data.nin.price,
          premium: data.nin.price + 100,
          long: data.nin.price + 50,
        });
      })
      .catch(() => {});
  }, []);

  // =========================
  // VERIFY NIN
  // =========================
  const handleVerify = async () => {
    if (!selectedType) return alert("Select a slip type");
    if (nin.length !== 11) return alert("NIN must be 11 digits");
    if (!consent) return alert("You must give consent");

    const price = prices[selectedType];

    if (balance < price) {
      return alert(`Insufficient balance. Required ₦${price}`);
    }

    setLoading(true);

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/verify-nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nin,
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
      setBalance(data.balance);

      // 🔥 AUTO DOWNLOAD AFTER VERIFY
      handleDownload(data, selectedType);

    } catch (error) {
      alert("Network error");
    }

    setLoading(false);
  };

  // =========================
  // DOWNLOAD SLIP
  // =========================
  const handleDownload = async (data, type) => {
    const info =
      data?.data?.data ||
      data?.data ||
      null;

    if (!info) return;

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
      a.download = `nin-${type}-slip.pdf`;
      a.click();

    } catch (err) {
      alert("Download failed");
    }
  };

  // =========================
  // STEP CHECKER
  // =========================
  const step1 = !!selectedType;
  const step2 = nin.length === 11;
  const step3 = consent;

  return (
    <div className="max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Verify NIN</h1>

      {/* ========================= */}
      {/* STEP INDICATOR */}
      {/* ========================= */}
      <div className="flex justify-between mb-6 text-sm">

        <div className={step1 ? "text-green-600" : ""}>1. Slip</div>
        <div className={step2 ? "text-green-600" : ""}>2. NIN</div>
        <div className={step3 ? "text-green-600" : ""}>3. Consent</div>
        <div className={result ? "text-green-600" : ""}>4. Done</div>

      </div>

      {/* ========================= */}
      {/* SLIP SELECTION */}
      {/* ========================= */}
      <div className="grid grid-cols-3 gap-3 mb-6">

        {["data", "premium", "long"].map(type => (
          <div
            key={type}
            onClick={() => setSelectedType(type)}
            className={`p-3 border rounded cursor-pointer text-center ${
              selectedType === type
                ? "bg-blue-600 text-white"
                : "bg-white"
            }`}
          >
            <p className="font-semibold capitalize">{type}</p>
            <p className="text-sm">₦{prices[type]}</p>
          </div>
        ))}

      </div>

      {/* ========================= */}
      {/* INPUT */}
      {/* ========================= */}
      <input
        type="text"
        placeholder="Enter 11-digit NIN"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        className="w-full border p-3 rounded mb-4"
      />

      {/* ========================= */}
      {/* CONSENT */}
      {/* ========================= */}
      <div className="flex items-start gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={() => setConsent(!consent)}
        />
        <p>
          I confirm that I have obtained proper consent from the NIN owner for this verification.
        </p>
      </div>

      {/* ========================= */}
      {/* BUTTON */}
      {/* ========================= */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="bg-black text-white w-full py-3 rounded"
      >
        {loading ? "Verifying..." : "Verify & Generate Slip"}
      </button>

      {/* ========================= */}
      {/* BALANCE */}
      {/* ========================= */}
      <p className="mt-4 text-sm text-gray-600">
        Balance: ₦{balance}
      </p>

    </div>
  );
}