import { useState, useEffect } from "react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [paystackReady, setPaystackReady] = useState(false);

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

  const handlePay = () => {
    if (!amount || amount <= 0) return alert("Enter valid amount");

    const handler = window.PaystackPop.setup({
      key: "pk_test_f0a111652a4fc257d0477d0aa29c967e0ab9b2c3",
      email: user.email,
      amount: amount * 100,

      callback: function (response) {
        fetch("https://xcombinator.onrender.com/api/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: response.reference,
            amount,
            userId: user.id,
          }),
        })
          .then(res => res.json())
          .then(() => {
            fetchBalance(); // 🔥 FORCE REFRESH
            setAmount("");
            alert("Payment successful");
          });
      },
    });

    handler.openIframe();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <p className="mb-4 font-medium">Balance: ₦{balance}</p>

      <div className="bg-white p-6 rounded shadow max-w-md">
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 mb-4 rounded"
        />

        <button
          onClick={handlePay}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Fund Wallet
        </button>
      </div>
    </div>
  );
}