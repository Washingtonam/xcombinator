import { useEffect, useState } from "react";

const API_BASE = "https://xcombinator.onrender.com";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH
  // =========================
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/transactions?userId=${user?.id}`
        );

        const data = await res.json();

        if (res.ok) {
          setTransactions(data);
        }
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    };

    if (user?.id) fetchTransactions();
  }, []);

  // =========================
  // HELPERS
  // =========================
  const getTitle = (tx) => {
    switch (tx.type) {
      case "UNIT_ADD":
        return "Wallet Funding";
      case "UNIT_DEDUCT":
        return "Unit Usage";
      case "NIN":
        return "NIN Verification";
      case "SERVICE":
        return "NIN Service Request";
      default:
        return "Transaction";
    }
  };

  const getAmount = (tx) => {
    if (tx.amount > 0) return `₦${tx.amount}`;
    if (tx.unitsUsed > 0) return `-${tx.unitsUsed} unit(s)`;
    if (tx.units > 0) return `+${tx.units} unit(s)`;
    return "-";
  };

  const isCredit = (tx) => tx.type === "UNIT_ADD";

  const statusStyle = (status) => {
    switch (status) {
      case "success":
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const icon = (type) => {
    switch (type) {
      case "UNIT_ADD":
        return "💰";
      case "SERVICE":
        return "🧾";
      case "NIN":
        return "🆔";
      default:
        return "📌";
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">
        Transactions
      </h1>

      <p className="text-gray-500 mb-6">
        Track all payments, services, and usage
      </p>

      {/* LOADING */}
      {loading && (
        <div className="text-center text-gray-500">
          Loading transactions...
        </div>
      )}

      {/* EMPTY */}
      {!loading && transactions.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow text-center">
          No transactions yet
        </div>
      )}

      {/* LIST */}
      <div className="space-y-4">

        {transactions.map((tx) => (
          <div
            key={tx._id}
            className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition flex justify-between items-center"
          >

            {/* LEFT */}
            <div className="flex gap-3 items-start">

              <div className="text-2xl">
                {icon(tx.type)}
              </div>

              <div>
                <p className="font-semibold text-gray-800">
                  {getTitle(tx)}
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(tx.createdAt).toLocaleString()}
                </p>

                {/* SERVICE INFO */}
                {tx.requestId?.service && (
                  <p className="text-xs text-gray-400">
                    {tx.requestId.service} ({tx.requestId.type})
                  </p>
                )}

                {/* NIN */}
                {tx.nin && (
                  <p className="text-xs text-gray-400">
                    NIN: {tx.nin}
                  </p>
                )}

                {/* PROOF */}
                {tx.proof && (
                  <a
                    href={tx.proof}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 underline"
                  >
                    View Proof
                  </a>
                )}
              </div>

            </div>

            {/* RIGHT */}
            <div className="text-right">

              {/* AMOUNT */}
              <p
                className={`font-semibold text-lg ${
                  isCredit(tx)
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {getAmount(tx)}
              </p>

              {/* STATUS */}
              <span
                className={`text-xs px-2 py-1 rounded-full ${statusStyle(tx.status)}`}
              >
                {tx.status}
              </span>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}