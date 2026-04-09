import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE = "https://xcombinator.onrender.com";

export default function NINServices() {
  const navigate = useNavigate();

  const [pricing, setPricing] = useState(null);

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/pricing`);
        const data = await res.json();
        setPricing(data);
      } catch (err) {
        console.error("Pricing error:", err);
      }
    };

    fetchPricing();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4">

      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">NIN Services</h1>
        <p className="text-gray-500 mt-1">
          Select a service to continue processing
        </p>
      </div>

      {/* ================= GRID ================= */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* ================= VALIDATION ================= */}
        <div className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg transition">

          <h2 className="text-lg font-semibold mb-2">Validation</h2>

          <p className="text-sm text-gray-500 mb-4">
            Validate NIN records with different verification types
          </p>

          {/* PRICING */}
          {pricing?.ninServices?.validation && (
            <div className="text-xs text-gray-600 mb-4 space-y-1">
              <p>• No Record: ₦{pricing.ninServices.validation.noRecord}</p>
              <p>• Update Record: ₦{pricing.ninServices.validation.updateRecord}</p>
              <p>• Modification: ₦{pricing.ninServices.validation.validateModification}</p>
              <p>• VNIN: ₦{pricing.ninServices.validation.vnin}</p>
            </div>
          )}

          <button
            onClick={() => navigate("/nin-services/validation")}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800"
          >
            Start Validation
          </button>

        </div>

        {/* ================= IPE CLEARANCE ================= */}
        <div className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg transition">

          <h2 className="text-lg font-semibold mb-2">IPE Clearance</h2>

          <p className="text-sm text-gray-500 mb-4">
            Resolve enrollment or tracking issues
          </p>

          {/* PRICING */}
          {pricing?.ninServices?.ipe && (
            <div className="text-xs text-gray-600 mb-4 space-y-1">
              <p>• Processing Error: ₦{pricing.ninServices.ipe.inProcessingError}</p>
              <p>• Still Processing: ₦{pricing.ninServices.ipe.stillProcessing}</p>
              <p>• New Enrollment: ₦{pricing.ninServices.ipe.newEnrollment}</p>
              <p>• Invalid Tracking: ₦{pricing.ninServices.ipe.invalidTracking}</p>
            </div>
          )}

          <button
            onClick={() => navigate("/nin-services/ipe-clearance")}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Start Clearance
          </button>

        </div>

        {/* ================= MODIFICATION ================= */}
        <div className="bg-white p-6 rounded-2xl shadow border hover:shadow-lg transition">

          <h2 className="text-lg font-semibold mb-2">Modification</h2>

          <p className="text-sm text-gray-500 mb-4">
            Request NIN data correction or updates
          </p>

          <div className="text-xs text-gray-600 mb-4">
            <p>• Name Correction</p>
            <p>• DOB Adjustment</p>
            <p>• Address Update</p>
          </div>

          <button
            onClick={() => navigate("/nin-services/modification")}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Start Modification
          </button>

        </div>

      </div>

      {/* ================= SLIP INFO ================= */}
      {pricing?.ninServices?.slipPrice && (
        <div className="mt-8 bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
          📄 Slip Generation Fee: <b>₦{pricing.ninServices.slipPrice}</b>
        </div>
      )}

      {/* ================= TRUST ================= */}
      <div className="mt-10 bg-white p-5 rounded-2xl shadow border">
        <h3 className="font-semibold mb-2">🔐 Secure Processing</h3>

        <p className="text-sm text-gray-500">
          All NIN services are processed securely. Ensure proper consent
          is obtained before submitting any identity verification request.
        </p>
      </div>

    </div>
  );
}