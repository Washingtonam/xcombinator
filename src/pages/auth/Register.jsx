import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    nin: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (form.password !== form.confirmPassword) {
      return alert("Passwords do not match");
    }

    try {
      const res = await fetch("https://xcombinator.onrender.com/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.error) return alert(data.error);

      alert("Registration successful");
      navigate("/login");

    } catch (error) {
      alert("Registration failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input name="firstName" placeholder="First Name" className="w-full border p-2 mb-3" onChange={handleChange} />
        <input name="lastName" placeholder="Last Name" className="w-full border p-2 mb-3" onChange={handleChange} />
        <input name="nin" placeholder="NIN" className="w-full border p-2 mb-3" onChange={handleChange} />
        <input name="email" placeholder="Email" className="w-full border p-2 mb-3" onChange={handleChange} />

        <div className="relative mb-3">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="w-full border p-2"
            onChange={handleChange}
          />
        </div>

        <input
          type={showPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          className="w-full border p-2 mb-3"
          onChange={handleChange}
        />

        <button
          onClick={() => setShowPassword(!showPassword)}
          className="text-sm text-blue-600 mb-3"
        >
          {showPassword ? "Hide Password" : "Show Password"}
        </button>

        <button
          onClick={handleRegister}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          Register
        </button>
      </div>
    </div>
  );
}