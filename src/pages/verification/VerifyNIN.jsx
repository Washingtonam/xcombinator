import { useState, useEffect } from "react";

export default function VerifyNIN() {
  const [nin, setNin] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));

  // LOAD BALANCE FROM BACKEND (USER BASED)
  useEffect(() => {
    fetch("https://xcombinator.onrender.com/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => setBalance(data.balance))
      .catch(err => console.error(err));
  }, []);

  const handleVerify = async () => {
    if (nin.length !== 11) {
      alert("NIN must be 11 digits");
      return;
    }

    if (balance < 100) {
      alert("Insufficient balance");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://xcombinator.onrender.com/verify-nin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          nin,
          userId: user.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error occurred");
        setLoading(false);
        return;
      }

      setResult(data);

      // UPDATE BALANCE FROM BACKEND RESPONSE
      setBalance(data.balance);

    } catch (error) {
      console.error(error);
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
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Verifying..." : "Verify NIN"}
        </button>
      </div>

      {result && (
        <div className="mt-6 bg-white p-6 rounded-xl shadow max-w-md border">
          <h2 className="font-semibold text-lg mb-4">Verification Result</h2>

          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Full Name:</span> {result?.data?.name}</p>
            <p><span className="font-medium">Phone Number:</span> {result?.data?.phone}</p>
            <p><span className="font-medium">Date of Birth:</span> {result?.data?.dob}</p>
            <p><span className="font-medium">NIN:</span> {result?.data?.nin}</p>
          </div>
        </div>
      )}
    </div>
  );
}