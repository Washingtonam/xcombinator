import { useEffect, useState } from "react";

export default function VerifyResult() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("nin_result");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return <div className="p-6 text-center">No data found</div>;
  }

  const info = data.data?.data || data.data;

  const downloadSlip = async (type) => {
    try {
      const res = await fetch("https://xcombinator.onrender.com/api/generate-nin-slip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: info,
          type,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}-slip.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      alert("Download failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-4">Verification Result</h1>

      {/* PROFILE */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">

        {info.photo && (
          <img
            src={`data:image/png;base64,${info.photo}`}
            alt="User"
            className="w-32 h-32 rounded-full mb-4"
          />
        )}

        <p><b>Name:</b> {info.firstname} {info.middlename} {info.surname}</p>
        <p><b>NIN:</b> {info.nin}</p>
        <p><b>Gender:</b> {info.gender}</p>
        <p><b>DOB:</b> {info.birthdate}</p>
        <p><b>Phone:</b> {info.telephoneno}</p>
        <p><b>Address:</b> {info.residence_address}</p>

      </div>

      {/* DOWNLOAD */}
      <div className="grid grid-cols-3 gap-3">
        {["data", "premium", "long"].map((type) => (
          <button
            key={type}
            onClick={() => downloadSlip(type)}
            className="bg-blue-600 text-white py-3 rounded"
          >
            Download {type}
          </button>
        ))}
      </div>

    </div>
  );
}