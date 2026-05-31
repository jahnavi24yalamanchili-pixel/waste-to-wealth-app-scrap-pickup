import React from "react";
import { useEffect, useMemo, useState } from "react";
import AuthPanel from "./AuthPanel";
import CollectorDashboard from "./CollectorDashboard";
import CustomerPickups from "./CustomerPickups";
import Header from "./Header";
import PickupForm from "./PickupForm";
import PriceList from "./PriceList";
import SelectedScrap from "./SelectedScrap";
import SummaryCards from "./SummaryCards";
import {
  createPickup,
  fallbackMaterials,
  getCurrentUser,
  getMaterials,
  loginUser,
  registerUser,
} from "../store/pickupStore";
import "../App.css";

const initialForm = {
  customerName: "",
  phone: "",
  address: "",
  scheduledDate: "",
  timeSlot: "09:00 AM - 12:00 PM",
};

function Home() {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem("wasteToWealthAuth");
    return saved ? JSON.parse(saved) : null;
  });
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(1);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [scheduleNotice, setScheduleNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    getMaterials()
      .then((data) => {
        setMaterials(data);
        setSelectedMaterial(data[0]?._id || "");
      })
      .catch(() => {
        setMaterials(fallbackMaterials);
        setSelectedMaterial(fallbackMaterials[0]._id);
        setMessage("Showing sample prices until backend is connected.");
      });
  }, []);

  useEffect(() => {
    if (!auth?.token) {
      return;
    }

    getCurrentUser(auth.token)
      .then((user) => {
        const nextAuth = { ...auth, user };
        setAuth(nextAuth);
        localStorage.setItem("wasteToWealthAuth", JSON.stringify(nextAuth));
      })
      .catch(() => {
        localStorage.removeItem("wasteToWealthAuth");
        setAuth(null);
        setMessage("Please login again to continue.");
      });
  }, [refreshKey]);

  const totals = useMemo(() => {
    return items.reduce(
      (total, item) => ({
        amount: total.amount + item.pricePerKg * item.estimatedWeightKg,
        points: total.points + item.greenPointsPerKg * item.estimatedWeightKg,
        weight: total.weight + item.estimatedWeightKg,
      }),
      { amount: 0, points: 0, weight: 0 }
    );
  }, [items]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const addItem = () => {
    const material = materials.find((item) => item._id === selectedMaterial);
    const weight = Number(estimatedWeightKg);

    if (!material || weight <= 0) {
      setMessage("Select a material and enter valid weight.");
      return;
    }

    setItems((current) => [...current, { ...material, estimatedWeightKg: weight }]);
    setEstimatedWeightKg(1);
    setMessage("");
    setScheduleNotice("");
  };

  const removeItem = (index) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleLogin = async (credentials) => {
    try {
      const data = await loginUser(credentials);
      const nextAuth = { token: data.token, user: data.payload };
      setAuth(nextAuth);
      localStorage.setItem("wasteToWealthAuth", JSON.stringify(nextAuth));
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRegister = async (user) => {
    try {
      await registerUser(user);
      setMessage("Account created successfully. Please login to continue.");
      return true;
    } catch (error) {
      setMessage(error.message);
      return false;
    }
  };

  const refreshAccount = async () => {
    if (!auth?.token) {
      return;
    }

    try {
      const user = await getCurrentUser(auth.token);
      const nextAuth = { ...auth, user };
      setAuth(nextAuth);
      localStorage.setItem("wasteToWealthAuth", JSON.stringify(nextAuth));
      setMessage("Account details updated.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("wasteToWealthAuth");
    setAuth(null);
    setItems([]);
    setMessage("");
  };

  const submitPickup = async (event) => {
    event.preventDefault();

    if (!auth || auth.user.role !== "CUSTOMER") {
      setMessage("Login as customer to schedule pickup.");
      return;
    }

    if (items.length === 0) {
      setMessage("Add at least one scrap item before scheduling.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");
    setScheduleNotice("");

    try {
      const data = await createPickup({
        ...form,
        customerName: auth.user.name,
        phone: auth.user.phone,
        items: items.map((item) => ({
          material: item._id,
          estimatedWeightKg: item.estimatedWeightKg,
        })),
      }, auth.token);
      const nextAuth = { ...auth, user: data.user };
      setAuth(nextAuth);
      localStorage.setItem("wasteToWealthAuth", JSON.stringify(nextAuth));
      setForm(initialForm);
      setItems([]);
      setRefreshKey((current) => current + 1);
      setScheduleNotice(
        `Pickup scheduled successfully for ${form.scheduledDate} (${form.timeSlot}). ${data.payload.greenPoints} Green Points added. Waiting for a collector to accept.`
      );
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <Header />
      <SummaryCards totals={totals} user={auth?.user} />

      {scheduleNotice && <div className="success-box">{scheduleNotice}</div>}

      {auth ? (
        <div className="user-strip">
          <div>
            <strong>{auth.user.name}</strong>
            <span>{auth.user.role} account</span>
          </div>
          <button type="button" className="secondary-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : (
        <AuthPanel onLogin={handleLogin} onRegister={handleRegister} message={message} />
      )}

      {auth?.user.role === "COLLECTOR" && <CollectorDashboard token={auth.token} />}

      {(!auth || auth.user.role === "CUSTOMER") && (
        <section className="workspace">
          {auth?.user.role === "CUSTOMER" ? (
            <PickupForm
              addItem={addItem}
              estimatedWeightKg={estimatedWeightKg}
              form={form}
              handleChange={handleChange}
              isSubmitting={isSubmitting}
              materials={materials}
              message={message}
              selectedMaterial={selectedMaterial}
              setEstimatedWeightKg={setEstimatedWeightKg}
              setSelectedMaterial={setSelectedMaterial}
              submitPickup={submitPickup}
            />
          ) : (
            <div className="panel">
              <h2>Login Required</h2>
              <p className="empty-text">Create a customer account to schedule scrap pickup.</p>
            </div>
          )}

          <div className="panel">
            <PriceList materials={materials} />
            <SelectedScrap items={items} removeItem={removeItem} />
          </div>
        </section>
      )}

      {auth?.user.role === "CUSTOMER" && (
        <CustomerPickups
          onRefreshUser={refreshAccount}
          token={auth.token}
          refreshKey={refreshKey}
        />
      )}
    </main>
  );
}

export default Home;
