import { useEffect, useState } from "react";

const API = "https://xcombinator.onrender.com";

export default function Modification() {

  const [pricing, setPricing] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH PRICING
  // =========================
  useEffect(() => {
    fetch(`${API}/api/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data?.ninServices?.modification || {});
      });
  }, []);

  const total = pricing?.[selectedType] || 0;

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // =========================
  // FILE UPLOAD
  // =========================
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return alert("File too large (max 2MB)");
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProof(reader.result);
    };
  };

  // =========================
  // SUBMIT (LOCKED FLOW)
  // =========================
  const submit = async () => {
    if (!selectedType || !formData.nin) {
      return alert("Fill all required fields");
    }

    if (!proof) {
      return alert("Upload payment proof");
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/nin-services/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: JSON.parse(localStorage.getItem("user")).id,
          service: "modification",
          type: selectedType,
          nin: formData.nin,
          slipType: "none",
          proof,
          formData
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("✅ Request submitted. Await admin approval.");

      setSelectedType(null);
      setFormData({});
      setProof(null);

    } catch (err) {
      alert(err.message);
    }

    setLoading(false);
  };

  // =========================
  // SERVICES
  // =========================
  const services = [
    { key: "name", label: "Name Modification" },
    { key: "phone", label: "Phone Number Change" },
    { key: "address", label: "Address Correction" },
    { key: "dob", label: "Date of Birth Modification" },
  ];

  return (
    <div className="max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        NIN Modification
      </h1>

      {/* SERVICES */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {services.map(s => (
          <button
            key={s.key}
            onClick={() => setSelectedType(s.key)}
            className={`p-4 rounded-xl border transition ${
              selectedType === s.key
                ? "bg-blue-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            <div className="font-bold text-lg">
              ₦{pricing?.[s.key] || 0}
            </div>
            <div className="text-sm">{s.label}</div>
          </button>
        ))}
      </div>

      {/* FORM */}
      {selectedType && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-3">

          <h2 className="font-semibold text-lg mb-2">
            Fill Details
          </h2>

          {/* COMMON */}
          <Input name="nin" placeholder="NIN" onChange={handleChange} />
          <Input name="surname" placeholder="Surname" onChange={handleChange} />
          <Input name="firstname" placeholder="First Name" onChange={handleChange} />
          <Input name="middlename" placeholder="Middle Name (Optional)" onChange={handleChange} />
          <Input name="email" placeholder="Email" onChange={handleChange} />

          {/* NAME */}
          {selectedType === "name" && (
            <>
              <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
              <Input name="previousModification" placeholder="Previous Modification (Yes/No)" onChange={handleChange} />
            </>
          )}

          {/* PHONE */}
          {selectedType === "phone" && (
            <>
              <Input name="oldGsm" placeholder="Old Phone Number" onChange={handleChange} />
              <Input name="newGsm" placeholder="New Phone Number" onChange={handleChange} />
            </>
          )}

          {/* ADDRESS */}
          {selectedType === "address" && (
            <>
              <Input name="address" placeholder="New Address" onChange={handleChange} />
              <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
            </>
          )}

          {/* DOB */}
          {selectedType === "dob" && (
            <div className="space-y-6">

              {/* BASIC INFO */}
              <Section title="Basic Information">
                <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
                <Input name="newDob" placeholder="New Date of Birth" onChange={handleChange} />
                <Input name="oldDob" placeholder="Old Date of Birth" onChange={handleChange} />
                <Input name="gender" placeholder="Gender" onChange={handleChange} />
                <Input name="maritalStatus" placeholder="Marital Status" onChange={handleChange} />
              </Section>

              {/* ORIGIN */}
              <Section title="Origin Details">
                <Input name="stateOfOrigin" placeholder="State of Origin" onChange={handleChange} />
                <Input name="lgaOfOrigin" placeholder="LGA of Origin" onChange={handleChange} />
                <Input name="townOfOrigin" placeholder="Town/Village of Origin" onChange={handleChange} />
              </Section>

              {/* BIRTH */}
              <Section title="Birth Details">
                <Input name="placeOfBirth" placeholder="Place of Birth" onChange={handleChange} />
                <Input name="stateOfBirth" placeholder="State of Birth" onChange={handleChange} />
                <Input name="lgaOfBirth" placeholder="LGA of Birth" onChange={handleChange} />
              </Section>

              {/* RESIDENCE */}
              <Section title="Birth Registration Details">
                <Input name="residentState" placeholder="Resident State" onChange={handleChange} />
                <Input name="residentLga" placeholder="Resident LGA" onChange={handleChange} />
                <Input name="registrationCenter" placeholder="Nearest Registration Center" onChange={handleChange} />
                <Input name="houseAddress" placeholder="Full House Address" onChange={handleChange} />
              </Section>

              {/* EDUCATION & WORK */}
              <Section title="Education & Work">
                <Input name="educationLevel" placeholder="Education Level" onChange={handleChange} />
                <Input name="occupation" placeholder="Occupation" onChange={handleChange} />
                <Input name="workAddress" placeholder="Work Address" onChange={handleChange} />
              </Section>

              {/* FATHER */}
              <Section title="Father’s Details">
                <Input name="fatherSurname" placeholder="Surname" onChange={handleChange} />
                <Input name="fatherFirstname" placeholder="First Name" onChange={handleChange} />
                <Input name="fatherMiddlename" placeholder="Middle Name" onChange={handleChange} />
                <Input name="fatherState" placeholder="State of Origin" onChange={handleChange} />
                <Input name="fatherLga" placeholder="LGA of Origin" onChange={handleChange} />
                <Input name="fatherTown" placeholder="Village/Town" onChange={handleChange} />
              </Section>

              {/* MOTHER */}
              <Section title="Mother’s Details">
                <Input name="motherSurname" placeholder="Surname" onChange={handleChange} />
                <Input name="motherFirstname" placeholder="First Name" onChange={handleChange} />
                <Input name="motherMaiden" placeholder="Maiden Name (Compulsory)" onChange={handleChange} />
                <Input name="motherState" placeholder="State of Origin" onChange={handleChange} />
                <Input name="motherLga" placeholder="LGA of Origin" onChange={handleChange} />
                <Input name="motherTown" placeholder="Village/Town" onChange={handleChange} />
              </Section>

            </div>
          )}

        </div>
      )}

      {/* TOTAL */}
      {selectedType && (
        <div className="bg-gray-100 p-4 rounded mb-4">
          <p className="font-bold">Total: ₦{total}</p>
        </div>
      )}

      {/* BANK */}
      {selectedType && (
        <div className="bg-yellow-50 p-4 rounded mb-4 text-sm">
          <p><b>Bank:</b> OPAY</p>
          <p><b>Account Number:</b> 6104102697</p>
          <p><b>Account Name:</b> WASHINGTON AMEDU</p>
        </div>
      )}

      {/* FILE */}
      {selectedType && (
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFile}
          className="mb-4"
        />
      )}

      {/* BUTTON */}
      {selectedType && (
        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      )}

    </div>
  );
}

// =========================
// INPUT COMPONENT
// =========================
function Input({ name, placeholder, onChange }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full border p-3 rounded-lg"
    />
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border">
      <h3 className="font-semibold mb-3 text-gray-700">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}