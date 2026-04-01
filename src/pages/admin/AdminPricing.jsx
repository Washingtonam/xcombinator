import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "https://xcombinator.onrender.com";

export default function AdminPricing() {
  const [dataPrice, setDataPrice] = useState("");
  const [premiumPrice, setPremiumPrice] = useState("");
  const [longPrice, setLongPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const headers = {
    email: localStorage.getItem("email"),
  };

  const fetchPricing = async () => {
    const res = await axios.get(`${API_BASE}/api/pricing`);

    setDataPrice(res.data.nin.data);
    setPremiumPrice(res.data.nin.premium);
    setLongPrice(res.data.nin.long);
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);

    try {
      await axios.put(
        `${API_BASE}/api/admin/pricing`,
        {
          dataPrice,
          premiumPrice,
          longPrice,
        },
        { headers }
      );

      alert("Pricing updated successfully");
    } catch (err) {
      alert("Update failed");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md max-w-md">

      <h2 className="text-xl font-bold mb-4">NIN Slip Pricing</h2>

      <input
        placeholder="Data Slip Price"
        value={dataPrice}
        onChange={(e) => setDataPrice(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />

      <input
        placeholder="Premium Slip Price"
        value={premiumPrice}
        onChange={(e) => setPremiumPrice(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />

      <input
        placeholder="Long Slip Price"
        value={longPrice}
        onChange={(e) => setLongPrice(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />

      <button
        onClick={handleUpdate}
        disabled={loading}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        {loading ? "Updating..." : "Update Pricing"}
      </button>

    </div>
  );
}