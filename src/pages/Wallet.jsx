import { useState, useEffect } from "react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    fetch("https://xcombinator.onrender.com/balance")
      .then(res => res.json())
      .then(data => setBalance(data.balance));
  }, []);

  const handlePay = () => {
    if (!amount || amount <= 0) {
      alert("Enter valid amount");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: "pk_test_f0a111652a4fc257d0477d0aa29c967e0ab9b2c3", // replace
      email: "customer@email.com", // dynamic later
      amount: amount * 100, // Paystack uses kobo
      currency: "NGN",

      callback: function (response) {
        // 👉 send reference to backend for verification
        fetch("https://xcombinator.onrender.com/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reference: response.reference,
            amount: amount,
          }),
        })
          .then(res => res.json())
          .then(data => {
            setBalance(data.balance);
            setAmount("");
            alert("Payment successful");
          });
      },

      onClose: function () {
        alert("Transaction cancelled");
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