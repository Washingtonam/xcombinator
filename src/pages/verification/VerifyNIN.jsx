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
      .catch(() => {});
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
        alert(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      setResult(data);

      if (!isAdmin && nin !== "00000000000") {
        setBalance(data.balance);
      }

      setTimeout(() => {
        handleDownload(data, selectedType);
      }, 400);

    } catch {
      alert("Network error");
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

    } catch {
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
    <div className="max-w-2xl mx-auto pb-20">

      {/* HEADER */}
      <h1 className="text-2xl md:text-3xl font-bold mb-2 dark:text-white">
        Verify NIN
      </h1>

      <p className="text-gray-500 mb-6">
        Enter a valid NIN to retrieve and generate slip
      </p>

      {/* STEP INDICATOR */}
      <div className="flex justify-between text-xs md:text-sm font-medium mb-6">
        <span className={step1 ? "text-green-600" : "text-gray-400"}>Slip</span>
        <span className={step2 ? "text-green-600" : "text-gray-400"}>NIN</span>
        <span className={step3 ? "text-green-600" : "text-gray-400"}>Consent</span>
        <span className={result ? "text-green-600" : "text-gray-400"}>Done</span>
      </div>

      {/* ========================= */}
      {/* SLIP TYPE */}
      {/* ========================= */}
      <div className="mb-6">

        <h2 className="font-semibold mb-3 dark:text-white">
          Select Slip Type
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {[
            { type: "data", label: "Data", price: prices.data },
            { type: "premium", label: "Premium", price: prices.premium },
            { type: "long", label: "Long", price: prices.long },
          ].map(item => (

            <div
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all ${
                selectedType === item.type
                  ? "border-green-600 bg-green-50 scale-105"
                  : "bg-white dark:bg-[#1A1A1A] dark:border-gray-800"
              }`}
            >
              <p className="font-semibold dark:text-white">{item.label}</p>
              <p className="text-sm text-gray-500">₦{item.price}</p>
            </div>

          ))}

        </div>

        {/* PREVIEW */}
        {selectedType && (
          <div className="mt-6">
            <p className="text-sm text-gray-500 mb-2">
              Preview ({selectedType})
            </p>

            <div className="rounded-xl overflow-hidden shadow border">
              <img
                src={`/slips/${selectedType}.png`}
                alt="preview"
                className="w-full h-56 object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* INPUT */}
      {/* ========================= */}
      <input
        type="text"
        placeholder="Enter 11-digit NIN"
        value={nin}
        onChange={(e) => setNin(e.target.value)}
        className="w-full border p-4 text-lg rounded-xl mb-3 focus:ring-2 focus:ring-green-500 outline-none"
      />

      <p className="text-xs text-gray-400 mb-4">
        👉 Use <b>00000000000</b> for test mode
      </p>

      {/* ========================= */}
      {/* CONSENT */}
      {/* ========================= */}
      <label className="flex items-start gap-2 mb-6 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={() => setConsent(!consent)}
        />
        <span className="text-gray-600">
          I confirm that I have obtained proper consent
        </span>
      </label>

      {/* ========================= */}
      {/* ACTION BUTTON */}
      {/* ========================= */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className={`w-full py-4 rounded-xl text-white font-semibold text-lg ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Processing..." : "Verify & Generate Slip"}
      </button>

      {/* SUCCESS */}
      {result && (
        <div className="mt-6 p-4 bg-green-100 text-green-700 rounded-lg text-center">
          ✅ Verification successful. Downloading slip...
        </div>
      )}

      {/* BALANCE */}
      <p className="mt-6 text-sm text-gray-500 text-center">
        Balance: ₦{balance}
      </p>

      {/* LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center text-white text-lg z-50">
          Processing...
        </div>
      )}

    </div>
  );
}