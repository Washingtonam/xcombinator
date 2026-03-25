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

      {result && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow max-w-md border">
          <h2 className="font-semibold text-lg mb-4">Verification Result</h2>

          {/* 🔥 IMAGE */}
          {result?.data?.photo && (
            <div className="flex justify-center mb-4">
              <img
                src={`data:image/jpeg;base64,${result.data.photo}`}
                alt="NIN"
                className="w-32 h-32 rounded-full object-cover border"
              />
            </div>
          )}

          <div className="space-y-2 text-sm">

            <p>
              <span className="font-medium">Full Name:</span>{" "}
              {result?.data?.surname}{" "}
              {result?.data?.firstname}{" "}
              {result?.data?.middlename}
            </p>

            <p>
              <span className="font-medium">Phone Number:</span>{" "}
              {result?.data?.telephoneno}
            </p>

            <p>
              <span className="font-medium">Date of Birth:</span>{" "}
              {result?.data?.birthdate}
            </p>

            <p>
              <span className="font-medium">Gender:</span>{" "}
              {result?.data?.gender}
            </p>

            <p>
              <span className="font-medium">NIN:</span>{" "}
              {result?.data?.nin}
            </p>

            <p>
              <span className="font-medium">State:</span>{" "}
              {result?.data?.residence_state}
            </p>

            <p>
              <span className="font-medium">LGA:</span>{" "}
              {result?.data?.residence_lga}
            </p>

            <p>
              <span className="font-medium">Address:</span>{" "}
              {result?.data?.residence_address}
            </p>

          </div>
        </div>
      )}
    </div>
  );
}