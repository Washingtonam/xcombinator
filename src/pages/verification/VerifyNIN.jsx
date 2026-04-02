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

  const isAdmin = user?.email === "washingtonamedu@gmail.com";

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    fetch("https://xcombinator.onrender.com/api/pricing")
      .then(res => res.json())
      .then(data => {
        if (data?.nin) {
          setPrices({
            data: data.nin.data || 350,
            premium: data.nin.premium || 450,
            long: data.nin.long || 400,
          });
        }
      })
      .catch(() => {
        console.log("Pricing fallback used");
      });
  }, []);

  // =========================
  // VERIFY
  // =========================
  const handleVerify = async () => {
    if (loading) return;

    if (!selectedType) return alert("Select a slip type");
    if (nin.length !== 11) return alert("NIN must be 11 digits");
    if (!consent) return alert("You must give consent");

    const price = prices[selectedType];

    // 🔥 ADMIN + MOCK BYPASS
    if (!isAdmin && nin !== "00000000000" && balance < price) {
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
        alert(data.error || "Verification failed. Try again.");
        setLoading(false);
        return;
      }

      setResult(data);

      // 🔥 Update balance only for real paid users
      if (!isAdmin && nin !== "00000000000") {
        setBalance(data.balance);
      }

      // 🔥 AUTO DOWNLOAD
      setTimeout(() => {
        handleDownload(data, selectedType);
      }, 400);

    } catch (error) {
      console.error(error);
      alert("Network or server error. Try again.");
    }

    setLoading(false);
  };

  // =========================
  // DOWNLOAD
  // =========================
  const handleDownload = async (data, type) => {
    const info =
      data?.data?.data ||
      data?.data ||
      null;

    if (!info) {
      alert("No data to generate slip");
      return;
    }

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

      if (!res.ok) {
        alert("Slip generation failed");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `nin-${type}-slip.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error(err);
      alert("Download failed");
    }
  };

  // =========================
  // STEP STATUS
  // =========================
  const step1 = !!selectedType;
  const step2 = nin.length === 11;
  const step3 = consent;

  return (
    <div className="max-w-2xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Verify NIN</h1>

      {/* STEP BAR */}
      <div className="flex justify-between mb-6 text-sm font-medium">
        <div className={step1 ? "text-green-600" : ""}>1. Slip</div>
        <div className={step2 ? "text-green-600" : ""}>2. NIN</div>
        <div className={step3 ? "text-green-600" : ""}>3. Consent</div>
        <div className={result ? "text-green-600" : ""}>4. Done</div>
      </div>

      {/* SLIP SELECTION */}
      <div className="mb-6">

        <h2 className="font-semibold mb-3">Select Slip Type</h2>

        <div className="grid grid-cols-3 gap-4">

          {[
            { type: "data", label: "Data", price: prices.data },
            { type: "premium", label: "Premium", price: prices.premium },
            { type: "long", label: "Long", price: prices.long },
          ].map(item => (

            <div
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${
                selectedType === item.type
                  ? "border-blue-600 bg-blue-50 scale-105"
                  : "bg-white"
              }`}
            >
              <p className="font-semibold">{item.label}</p>
              <p className="text-sm text-gray-500">₦{item.price}</p>
            </div>

          ))}

        </div>

        {/* PREVIEW */}
        {selectedType && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Preview ({selectedType} slip)
            </p>

            <div className="rounded-xl overflow-hidden shadow-lg border">
              <img
                src={`/slips/${selectedType}.png`}
                alt="Slip preview"
                className="w-full object-cover transition-all duration-500 hover:scale-105"
              />
            </div>
          </div>
        )}

      </div>

      {/* INPUT */}
      <input
        type="text"
        placeholder="Enter 11-digit NIN"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        className="w-full border p-3 rounded mb-2"
      />

      {/* MOCK INFO */}
      <p className="text-xs text-gray-400 mb-4">
        👉 Use <b>00000000000</b> for test mode (no charges)
      </p>

      {/* CONSENT */}
      <div className="flex items-start gap-2 mb-4 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={() => setConsent(!consent)}
        />
        <p>
          I confirm that I have obtained proper consent from the NIN owner.
        </p>
      </div>

      {/* BUTTON */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-full py-3 rounded text-white ${
          loading ? "bg-gray-400" : "bg-black"
        }`}
      >
        {loading ? "Processing..." : "Verify & Generate Slip"}
      </button>

      {/* BALANCE */}
      <p className="mt-4 text-sm text-gray-600">
        Balance: ₦{balance}
      </p>

    </div>
  );
}