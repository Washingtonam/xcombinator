import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function VerifyNIN() {
  const [nin, setNin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user, balance, setBalance } = useUser();

  const handleVerify = async () => {
    if (nin.length !== 11) {
      return alert("NIN must be 11 digits");
    }

    if (balance < 100) {
      return alert("Insufficient balance");
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

    } catch (error) {
      console.error(error);
      alert("Network error");
    }

    setLoading(false);
  };

  // 🔥 FLEXIBLE DATA HANDLING (FINAL FIX)
  const info =
    result?.data?.data ||
    result?.data ||
    null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Verify NIN</h1>

      <p className="mb-4 font-medium">Balance: ₦{balance}</p>

      <div className="bg-white p-6 rounded shadow max-w-md">
        <input
          type="text"
          placeholder="Enter NIN (11 digits)"
          value={nin}
          onChange={(e) => setNin(e.target.value)}
          className="w-full border p-3 mb-4 rounded"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Verifying..." : "Verify NIN"}
        </button>
      </div>

      {info && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow max-w-md border">
          <h2 className="font-semibold text-lg mb-4">Verification Result</h2>

          {/* IMAGE */}
          {info.photo && (
            <div className="flex justify-center mb-4">
              <img
                src={
                  info.photo.startsWith("data:")
                    ? info.photo
                    : `data:image/jpeg;base64,${info.photo}`
                }
                alt="NIN"
                className="w-32 h-32 rounded-full object-cover border"
              />
            </div>
          )}

          <div className="space-y-2 text-sm">
            <p><b>First Name:</b> {info.firstname || "N/A"}</p>
            <p><b>Middle Name:</b> {info.middlename || "N/A"}</p>
            <p><b>Last Name:</b> {info.surname || "N/A"}</p>

            <p><b>Phone:</b> {info.telephoneno || "N/A"}</p>
            <p><b>Date of Birth:</b> {info.birthdate || "N/A"}</p>
            <p><b>Gender:</b> {info.gender || "N/A"}</p>

            <p><b>NIN:</b> {info.nin || "N/A"}</p>

            <p><b>State:</b> {info.residence_state || "N/A"}</p>
            <p><b>LGA:</b> {info.residence_lga || "N/A"}</p>
            <p><b>Address:</b> {info.residence_address || "N/A"}</p>
          </div>
        </div>
      )}
    </div>
  );
}