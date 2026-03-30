import { useState, useEffect } from "react";

export default function Wallet() {
  const [amount, setAmount] = useState("");
  const [proof, setProof] = useState(null);
  const [balance, setBalance] = useState(0);
  const [paystackReady, setPaystackReady] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH BALANCE
  // =========================
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

    // LOAD PAYSTACK
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;

    script.onload = () => setPaystackReady(true);

    document.body.appendChild(script);
  }, []);

  // =========================
  // FILE UPLOAD (BASE64)
  // =========================
  const handleFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  // =========================
  // SUBMIT MANUAL PAYMENT
  // =========================
  const submitPayment = async () => {
    if (!amount || !proof) {
      return alert("Enter amount and upload proof");
    }

    try {
      await fetch("https://xcombinator.onrender.com/api/payment-request", {
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

      alert("Payment submitted. Await admin approval.");
      setAmount("");
      setProof(null);

    } catch (error) {
      console.error(error);
      alert("Submission failed");
    }
  };

  // =========================
  // PAYSTACK PAYMENT
  // =========================
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
            fetchBalance();
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

      {/* ========================= */}
      {/* MANUAL FUNDING */}
      {/* ========================= */}
      <div className="bg-white p-6 rounded shadow max-w-md mb-6">

        <h2 className="font-bold mb-2">Manual Funding</h2>

        <div className="bg-gray-100 p-4 rounded space-y-2">
          <p><b>Bank:</b> Moniepoint</p>
          <p><b>Account Number:</b> 8161495298</p>
          <p><b>Account Name:</b> Steve Computer Warehouse Limited</p>
        </div>

        <p className="text-sm mt-3 text-gray-600">
          Upload proof after transfer (no WhatsApp needed)
        </p>

        <input
          type="number"
          placeholder="Amount sent"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border p-3 mt-4 rounded"
        />

        <input
          type="file"
          onChange={handleFile}
          className="mt-3"
        />

        <button
          onClick={submitPayment}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-4"
        >
          Submit Payment
        </button>
      </div>

      {/* ========================= */}
      {/* PAYSTACK */}
      {/* ========================= */}
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
          disabled={!paystackReady}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          Fund Wallet (Online)
        </button>

      </div>
    </div>
  );
}