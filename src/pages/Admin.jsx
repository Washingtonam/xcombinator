import { useEffect, useState } from "react";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // fetch users
    fetch("https://xcombinator.onrender.com/admin/users")
      .then(res => res.json())
      .then(data => setUsers(data));

    // fetch transactions
    fetch("https://xcombinator.onrender.com/admin/transactions")
      .then(res => res.json())
      .then(data => setTransactions(data));
  }, []);

  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);
  const totalTransactions = transactions.length;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total Users</h2>
          <p className="text-2xl">{users.length}</p>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Total System Balance</h2>
          <p className="text-2xl">₦{totalBalance}</p>
        </div>

        <div className="bg-white p-6 rounded shadow col-span-2">
          <h2 className="text-lg font-semibold">Total Transactions</h2>
          <p className="text-2xl">{totalTransactions}</p>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white p-6 rounded shadow mb-10">
        <h2 className="text-lg font-semibold mb-4">Users</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>ID</th>
              <th>Email</th>
              <th>Balance</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b">
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>₦{user.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">All Transactions</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th>Type</th>
              <th>Amount</th>
              <th>User ID</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b">
                <td>{tx.type}</td>
                <td>₦{tx.amount}</td>
                <td>{tx.userId}</td>
                <td>{new Date(tx.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}