import { useEffect, useState } from "react";
import ModificationNoticeModal from "../../components/ModificationNoticeModal";

const API = "https://xcombinator.onrender.com";

export default function Modification() {

  const [pricing, setPricing] = useState({});
  const [selectedType, setSelectedType] = useState(null);
  const [formData, setFormData] = useState({});
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/pricing`)
      .then(res => res.json())
      .then(data => {
        setPricing(data?.ninServices?.modification || {});
      });
  }, []);

  const total = pricing?.[selectedType] || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const services = [
    { key: "name", label: "Name Modification", desc: "Fix name errors & spelling issues" },
    { key: "phone", label: "Phone Number Change", desc: "Update your linked phone number" },
    { key: "address", label: "Address Correction", desc: "Correct residential details" },
    { key: "dob", label: "Date of Birth Modification", desc: "Fix date of birth records" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4">

      <ModificationNoticeModal />

      {/* HERO */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          NIN Modification Services
        </h1>
        <p className="text-gray-500">
          Fix errors, update your details, and get it done right the first time.
        </p>
      </div>

      {/* SERVICES */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {services.map(s => (
          <div
            key={s.key}
            onClick={() => setSelectedType(s.key)}
            className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 ${
              selectedType === s.key
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-white hover:shadow-md hover:-translate-y-1"
            }`}
          >
            <p className="text-xs opacity-70 mb-2">STARTING FROM</p>

            <h2 className="text-xl font-bold mb-1">
              ₦{pricing?.[s.key] || 0}
            </h2>

            <p className="font-semibold">{s.label}</p>
            <p className="text-xs opacity-70 mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* FORM */}
      {selectedType && (
        <div className="bg-white p-6 rounded-2xl shadow mb-6 space-y-4">

          <h2 className="font-semibold text-lg mb-2">
            Fill Details
          </h2>

          <Input name="nin" placeholder="NIN" onChange={handleChange} />
          <Input name="surname" placeholder="Surname" onChange={handleChange} />
          <Input name="firstname" placeholder="First Name" onChange={handleChange} />
          <Input name="middlename" placeholder="Middle Name (Optional)" onChange={handleChange} />
          <Input name="email" placeholder="Email" onChange={handleChange} />

          {selectedType === "name" && (
            <>
              <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
              <Input name="previousModification" placeholder="Previous Modification (Yes/No)" onChange={handleChange} />
            </>
          )}

          {selectedType === "phone" && (
            <>
              <Input name="oldGsm" placeholder="Old Phone Number" onChange={handleChange} />
              <Input name="newGsm" placeholder="New Phone Number" onChange={handleChange} />
            </>
          )}

          {selectedType === "address" && (
            <>
              <Input name="address" placeholder="New Address" onChange={handleChange} />
              <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
            </>
          )}

          {selectedType === "dob" && (
            <div className="space-y-6">

              <Section title="Basic Information">
                <Input name="gsm" placeholder="Phone Number" onChange={handleChange} />
                <Input name="newDob" placeholder="New Date of Birth" onChange={handleChange} />
                <Input name="oldDob" placeholder="Old Date of Birth" onChange={handleChange} />
                <Input name="gender" placeholder="Gender" onChange={handleChange} />
                <Input name="maritalStatus" placeholder="Marital Status" onChange={handleChange} />
              </Section>

              <Section title="Origin Details">
                <Input name="stateOfOrigin" placeholder="State of Origin" onChange={handleChange} />
                <Input name="lgaOfOrigin" placeholder="LGA of Origin" onChange={handleChange} />
                <Input name="townOfOrigin" placeholder="Town/Village of Origin" onChange={handleChange} />
              </Section>

              <Section title="Birth Details">
                <Input name="placeOfBirth" placeholder="Place of Birth" onChange={handleChange} />
                <Input name="stateOfBirth" placeholder="State of Birth" onChange={handleChange} />
                <Input name="lgaOfBirth" placeholder="LGA of Birth" onChange={handleChange} />
              </Section>

              <Section title="Birth Registration Details">
                <Input name="residentState" placeholder="Resident State" onChange={handleChange} />
                <Input name="residentLga" placeholder="Resident LGA" onChange={handleChange} />
                <Input name="registrationCenter" placeholder="Nearest Registration Center" onChange={handleChange} />
                <Input name="houseAddress" placeholder="Full House Address" onChange={handleChange} />
              </Section>

              <Section title="Education & Work">
                <Input name="educationLevel" placeholder="Education Level" onChange={handleChange} />
                <Input name="occupation" placeholder="Occupation" onChange={handleChange} />
                <Input name="workAddress" placeholder="Work Address" onChange={handleChange} />
              </Section>

              <Section title="Father’s Details">
                <Input name="fatherSurname" placeholder="Surname" onChange={handleChange} />
                <Input name="fatherFirstname" placeholder="First Name" onChange={handleChange} />
                <Input name="fatherMiddlename" placeholder="Middle Name" onChange={handleChange} />
                <Input name="fatherState" placeholder="State of Origin" onChange={handleChange} />
                <Input name="fatherLga" placeholder="LGA of Origin" onChange={handleChange} />
                <Input name="fatherTown" placeholder="Village/Town" onChange={handleChange} />
              </Section>

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

      {/* SUMMARY CARD */}
      {selectedType && (
        <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl mb-4 flex justify-between items-center">
          <p className="font-semibold text-blue-700">Total Cost</p>
          <p className="text-xl font-bold text-blue-900">₦{total}</p>
        </div>
      )}

      {/* BANK */}
      {selectedType && (
        <div className="bg-yellow-50 p-5 rounded-xl mb-4 text-sm border">
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
        >
          {loading ? "Submitting..." : "Submit Request"}
        </button>
      )}

    </div>
  );
}

// INPUT
function Input({ name, placeholder, onChange }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
    />
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border">
      <h3 className="font-semibold mb-3 text-gray-700">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}