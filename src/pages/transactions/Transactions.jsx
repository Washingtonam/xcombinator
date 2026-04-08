import { useEffect, useState } from "react";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  // =========================
  // FETCH TRANSACTIONS
  // =========================
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(
          `https://xcombinator.onrender.com/api/transactions?userId=${user.id}`
        );

        const data = await res.json();

        if (res.ok) {
          setTransactions(data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Transaction fetch error:", err);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Transactions</h1>

      <div className="bg-white p-6 rounded shadow">

        {loading ? (
          <p className="text-gray-500">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">

            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Type</th>
                <th>Details</th>
                <th>Units</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b">

                  {/* TYPE */}
                  <td className="py-2 font-medium">
                    {tx.type === "UNIT_ADD" && "💰 Funding"}
                    {tx.type === "NIN" && "🆔 NIN Verification"}
                    {tx.type === "UNIT_DEDUCT" && "📉 Usage"}
                  </td>

                  {/* DETAILS */}
                  <td>
                    {tx.nin || "-"}
                  </td>

                  {/* UNITS */}
                  <td>
                    {tx.units || tx.unitsUsed || 0}
                  </td>

                  {/* STATUS */}
                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        tx.status === "success" || tx.status === "approved"
                          ? "bg-green-500 text-white"
                          : tx.status === "pending"
                          ? "bg-yellow-400"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  {/* DATE */}
                  <td>
                    {new Date(tx.createdAt).toLocaleString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}