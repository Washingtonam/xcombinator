import { useState } from "react";
import { useUser } from "../../context/UserContext";

export default function VerifyBVN() {
  const [bvn, setBvn] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, balance, setBalance } = useUser();

  const handleVerify = async () => {
    if (bvn.length !== 11) {
      return alert("BVN must be 11 digits");
    }

    if (balance < 100) {
      return alert("Insufficient balance");
    }

    setLoading(true);

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/verify-bvn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bvn,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Verification failed");
        setLoading(false);
        return;
      }

      // 🔥 GLOBAL UPDATE
      setBalance(data.balance);

      alert("BVN Verified Successfully");

    } catch (error) {
      console.error(error);
      alert("Network error");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Verify BVN</h1>

      <p className="mb-4 font-medium">Balance: ₦{balance}</p>

      <div className="bg-white p-6 rounded shadow max-w-md">
        <input
          type="text"
          placeholder="Enter BVN (11 digits)"
          value={bvn}
          onChange={(e) => setBvn(e.target.value)}
          className="w-full border p-3 mb-4 rounded"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Verifying..." : "Verify BVN"}
        </button>
      </div>
    </div>
  );
}