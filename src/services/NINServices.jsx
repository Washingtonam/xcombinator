import { useNavigate } from "react-router-dom";

export default function NINServices() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-2">NIN Services</h1>
      <p className="text-gray-500 mb-6">
        Select a service to continue
      </p>

      {/* SERVICES GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* IP CLEARANCE */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-2">IP Clearance</h2>

          <p className="text-sm text-gray-500 mb-4">
            Submit NIN for clearance processing
          </p>

          <button
            onClick={() => navigate("/nin-services/ip-clearance")}
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Continue
          </button>
        </div>

        {/* VALIDATION */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h2 className="text-lg font-semibold mb-2">Validation</h2>

          <p className="text-sm text-gray-500 mb-4">
            Validate NIN records securely
          </p>

          <button
            onClick={() => navigate("/nin-services/validation")}
            className="w-full bg-black text-white py-2 rounded"
          >
            Continue
          </button>
        </div>

      </div>

    </div>
  );
}