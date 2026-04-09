import { useEffect, useState } from "react";

export default function VerifyResult() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nin_result");

      if (!stored) return;

      const parsed = JSON.parse(stored);

      // 🔥 SAFE EXTRACTION (handles all cases)
      const extracted =
        parsed?.data?.data ||
        parsed?.data ||
        parsed;

      setInfo(extracted);

    } catch (err) {
      console.error("Result parse error:", err);
    }
  }, []);

  if (!info) {
    return (
      <div className="p-6 text-center text-gray-500">
        No verification data found. Please verify again.
      </div>
    );
  }

  // =========================
  // DOWNLOAD
  // =========================
  const [loadingType, setLoadingType] = useState(null);

  const downloadSlip = async (type) => {
    if (loadingType) return; // 🔥 block multiple clicks

    setLoadingType(type);

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

    } catch {
      alert("Download failed");
    }

    setLoadingType(null);
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">
        NIN Verification Result
      </h1>

      {/* PROFILE */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">

        {/* PHOTO */}
        {info.photo && (
          <img
            src={`data:image/png;base64,${info.photo}`}
            alt="User"
            className="w-32 h-32 rounded-full mb-4 object-cover"
          />
        )}

        {/* DETAILS */}
        <div className="space-y-2 text-sm">

          <p><b>Name:</b> {info.firstname} {info.middlename} {info.surname}</p>
          <p><b>NIN:</b> {info.nin}</p>
          <p><b>Gender:</b> {info.gender}</p>
          <p><b>Date of Birth:</b> {info.birthdate}</p>
          <p><b>Phone:</b> {info.telephoneno}</p>
          <p><b>Address:</b> {info.residence_address}</p>
          <p><b>State:</b> {info.residence_state}</p>
          <p><b>LGA:</b> {info.residence_lga}</p>

        </div>

      </div>

      {/* DOWNLOAD */}
      <div className="grid grid-cols-3 gap-3">
        {["data", "premium", "long"].map((type) => (
        <button
          key={type}
          onClick={() => downloadSlip(type)}
          disabled={loadingType !== null}
          className={`py-3 rounded text-white ${
            loadingType === type
              ? "bg-gray-400"
              : loadingType
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600"
          }`}
        >
          {loadingType === type
            ? "Generating..."
            : `Download ${type}`}
        </button>
      ))}
      </div>

    </div>
  );
}