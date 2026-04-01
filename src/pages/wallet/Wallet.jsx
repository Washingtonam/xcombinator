import { useState, useEffect } from "react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [balance, setBalance] = useState(0);
  const [paystackReady, setPaystackReady] = useState(false);
  const [loading, setLoading] = useState(false); // 🔥 NEW

  const user = JSON.parse(localStorage.getItem("user"));

  const fetchBalance = () => {
    fetch("https://xcombinator.onrender.com/api/balance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => setBalance(data.balance));
  };

  useEffect(() => {
    fetchBalance();

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => setPaystackReady(true);

    document.body.appendChild(script);
  }, []);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  const submitPayment = async () => {
    if (!amount || !proof) {
      return alert("Enter amount and upload proof");
    }

    setLoading(true); // 🔥 LOCK BUTTON

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/submit-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          amount: Number(amount),
          proof,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        setLoading(false);
        return;
      }

      alert("Payment submitted. Await approval.");
      setAmount("");
      setProof(null);

    } catch (error) {
      alert("Submission failed");
    }

    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <p className="mb-4 font-medium">Balance: ₦{balance}</p>

      <div className="bg-white p-6 rounded shadow max-w-md mb-6">
        <h2 className="font-bold mb-2">Manual Funding</h2>

        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p><b>Bank:</b> Moniepoint</p>
          <p><b>Account Number:</b> 8161495298</p>
          <p><b>Account Name:</b> Steve Computer Warehouse Limited</p>
        </div>

        <input
          type="number"
          placeholder="Amount sent"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 mt-4 rounded"
        />

        <input type="file" onChange={handleFile} className="mt-3" />

        <button
          onClick={submitPayment}
          disabled={loading}
          className={`w-full mt-4 px-4 py-2 rounded text-white ${
            loading ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? "Submitting..." : "Submit Payment"}
        </button>
      </div>
    </div>
  );
}