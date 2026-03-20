import { useState, useEffect } from "react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch("https://xcombinator.onrender.com/balance")
      .then(res => res.json())
      .then(data => setBalance(data.balance));
  }, []);

  const handleFund = async () => {
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    try {
      const res = await fetch("https://xcombinator.onrender.com/fund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();

      setBalance(data.balance);
      setAmount("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <p className="mb-4 font-medium">Current Balance: ₦{balance}</p>

      <div className="bg-white p-6 rounded shadow max-w-md">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 mb-4 rounded"
        />

        <button
          onClick={handleFund}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Fund Wallet
        </button>
      </div>
    </div>
  );
}