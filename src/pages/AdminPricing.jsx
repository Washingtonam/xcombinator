import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPricing() {
  const [ninPrice, setNinPrice] = useState("");
  const [bvnPrice, setBvnPrice] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch current pricing
  const fetchPricing = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/pricing");

      setNinPrice(res.data.nin.price);
      setBvnPrice(res.data.bvn.price);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  // Update pricing
  const handleUpdate = async () => {
    setLoading(true);

    try {
      await axios.put(
        "http://localhost:5000/api/admin/pricing",
        {
          ninPrice,
          bvnPrice,
        },
        {
          headers: {
            email: "admin@xcombinator.com",
          },
        }
      );

      alert("Pricing updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update pricing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md">
      <h2 className="text-xl font-bold mb-4">Admin Pricing Control</h2>

      <div className="mb-4">
        <label className="block mb-1">NIN Price (₦)</label>
        <input
          type="number"
          value={ninPrice}
          onChange={(e) => setNinPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">BVN Price (₦)</label>
        <input
          type="number"
          value={bvnPrice}
          onChange={(e) => setBvnPrice(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Updating..." : "Update Pricing"}
      </button>
    </div>
  );
}