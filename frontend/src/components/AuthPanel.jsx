import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";

function AuthPanel({ onLogin, onRegister, message }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "CUSTOMER",
    vehicleNumber: "",
  });

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (mode === "login") {
      onLogin({ email: form.email, password: form.password });
      return;
    }

    const isRegistered = await onRegister(form);

    if (isRegistered) {
      setMode("login");
      setForm((current) => ({
        ...current,
        password: "",
        vehicleNumber: "",
      }));
    }
  };

  return (
    <div className="panel auth-panel">
      <div className="auth-tabs">
        <button
          type="button"
          className={mode === "login" ? "tab active" : "tab"}
          onClick={() => setMode("login")}
        >
          <LogIn size={18} /> Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "tab active" : "tab"}
          onClick={() => setMode("register")}
        >
          <UserPlus size={18} /> Register
        </button>
      </div>

      <form className="pickup-form" onSubmit={handleSubmit}>
        {mode === "register" && (
          <>
            <label>
              Name
              <input name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>
              Phone
              <input name="phone" value={form.phone} onChange={handleChange} required />
            </label>
            <label>
              Role
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="CUSTOMER">Customer</option>
                <option value="COLLECTOR">Collector</option>
              </select>
            </label>
            {form.role === "COLLECTOR" && (
              <label>
                Vehicle Number
                <input
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleChange}
                  placeholder="TS 09 AB 1234"
                  required
                />
              </label>
            )}
            <label className="full-width">
              Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows="2"
              />
            </label>
          </>
        )}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            minLength="6"
            required
          />
        </label>

        {message && <p className="message">{message}</p>}

        <button className="primary-btn full-width">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </div>
  );
}

export default AuthPanel;
