import React, { useEffect, useState } from "react";
import { MessageCircle, Phone, RefreshCw, Truck } from "lucide-react";
import { getMyPickups } from "../store/pickupStore";

function CustomerPickups({ onRefreshUser, token, refreshKey }) {
  const [pickups, setPickups] = useState([]);
  const [message, setMessage] = useState("");

  const statusText = (pickup) => {
    if (pickup.status === "accepted" && pickup.assignedCollector) {
      return `Accepted by ${pickup.assignedCollector.name}`;
    }

    if (pickup.status === "scheduled") {
      return "Waiting for collector acceptance";
    }

    if (pickup.status === "out-for-pickup") {
      return "Collector is out for pickup";
    }

    if (pickup.status === "picked") {
      return "Pickup completed";
    }

    return pickup.status.replaceAll("-", " ");
  };

  const cleanPhone = (phone = "") => phone.replace(/\D/g, "");
  const whatsappPhone = (phone = "") => {
    const cleaned = cleanPhone(phone);
    return cleaned.length === 10 ? `91${cleaned}` : cleaned;
  };

  const whatsappLink = (pickup) => {
    const phone = whatsappPhone(pickup.assignedCollector?.phone);
    const text = encodeURIComponent(
      `Hi ${pickup.assignedCollector?.name}, I am checking my Waste to Wealth pickup scheduled for ${new Date(
        pickup.scheduledDate
      ).toLocaleDateString()} at ${pickup.timeSlot}.`
    );

    return `https://wa.me/${phone}?text=${text}`;
  };

  const loadPickups = () => {
    getMyPickups(token)
      .then((data) => {
        setPickups(data);
        setMessage("");
      })
      .catch((error) => {
        setPickups([]);
        setMessage(error.message);
      });
  };

  useEffect(() => {
    loadPickups();

    const refreshTimer = window.setInterval(loadPickups, 15000);
    return () => window.clearInterval(refreshTimer);
  }, [token, refreshKey]);

  return (
    <div className="panel dashboard-panel">
      <div className="panel-title-row">
        <h2>My Pickups</h2>
        <button
          type="button"
          className="secondary-btn icon-btn"
          onClick={() => {
            loadPickups();
            onRefreshUser();
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="pickup-list">
        {pickups.length === 0 ? (
          <p className="empty-text">No pickups scheduled yet.</p>
        ) : (
          pickups.map((pickup) => (
            <div className="pickup-card customer-pickup-card" key={pickup._id}>
              <div>
                <strong>{statusText(pickup)}</strong>
                <span>{pickup.address}</span>
                <span>
                  Pickup time: {new Date(pickup.scheduledDate).toLocaleDateString()} |{" "}
                  {pickup.timeSlot}
                </span>
                <span>Amount: Rs. {pickup.estimatedAmount}</span>
                <span>Green Points: {pickup.greenPoints}</span>
              </div>

              {pickup.assignedCollector ? (
                <div className="collector-card">
                  <div className="collector-heading">
                    <Truck size={18} />
                    <strong>{pickup.assignedCollector.name}</strong>
                  </div>
                  <span>Phone: {pickup.assignedCollector.phone}</span>
                  <span>Vehicle: {pickup.assignedCollector.vehicleNumber || "Not added"}</span>
                  <div className="contact-actions">
                    <a href={`tel:${pickup.assignedCollector.phone}`}>
                      <Phone size={16} />
                      Call
                    </a>
                    <a href={`sms:${pickup.assignedCollector.phone}`}>
                      <MessageCircle size={16} />
                      SMS
                    </a>
                    {whatsappPhone(pickup.assignedCollector.phone) && (
                      <a href={whatsappLink(pickup)} target="_blank" rel="noreferrer">
                        <MessageCircle size={16} />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="collector-card pending">
                  <strong>Collector not assigned yet</strong>
                  <span>You will see contact and vehicle details after acceptance.</span>
                </div>
              )}

              {pickup.collectorNote && (
                <div className="pickup-note">
                  <strong>Collector note</strong>
                  <span>{pickup.collectorNote}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerPickups;
