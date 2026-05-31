import React, { useEffect, useState } from "react";
import {
  acceptPickup,
  getCollectorPickups,
  getOpenPickups,
  rejectPickup,
  updatePickupStatus,
} from "../store/pickupStore";

function CollectorDashboard({ token }) {
  const [openPickups, setOpenPickups] = useState([]);
  const [acceptedPickups, setAcceptedPickups] = useState([]);
  const [message, setMessage] = useState("");

  const loadPickups = () => {
    Promise.all([getOpenPickups(token), getCollectorPickups(token)])
      .then(([openData, acceptedData]) => {
        setOpenPickups(openData);
        setAcceptedPickups(acceptedData);
      })
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadPickups();
  }, []);

  const handleStatus = async (pickupId, status) => {
    try {
      await updatePickupStatus(pickupId, status, token);
      setMessage("Pickup updated.");
      loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAccept = async (pickupId) => {
    try {
      await acceptPickup(pickupId, token);
      setMessage("Pickup accepted. Customer can now see your details.");
      loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleReject = async (pickupId) => {
    try {
      await rejectPickup(pickupId, token);
      setMessage("Pickup request removed from your list.");
      loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="panel dashboard-panel">
      <h2>Collector Pickup Requests</h2>
      {message && <p className="message">{message}</p>}

      <h3>Open Requests</h3>
      <div className="pickup-list">
        {openPickups.length === 0 ? (
          <p className="empty-text">No open pickup requests right now.</p>
        ) : (
          openPickups.map((pickup) => (
            <div className="pickup-card" key={pickup._id}>
              <div>
                <strong>{pickup.customer?.name}</strong>
                <span>{pickup.phone}</span>
                <span>{pickup.address}</span>
                <span>{new Date(pickup.scheduledDate).toLocaleDateString()} | {pickup.timeSlot}</span>
                <span>Estimated amount: ₹{pickup.estimatedAmount}</span>
              </div>
              <div className="status-actions">
                <button type="button" onClick={() => handleAccept(pickup._id)}>
                  Accept
                </button>
                <button type="button" className="danger-btn" onClick={() => handleReject(pickup._id)}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <h3>Accepted By You</h3>
      <div className="pickup-list">
        {acceptedPickups.length === 0 ? (
          <p className="empty-text">No accepted pickups yet.</p>
        ) : (
          acceptedPickups.map((pickup) => (
            <div className="pickup-card" key={pickup._id}>
              <div>
                <strong>{pickup.customer?.name}</strong>
                <span>{pickup.customer?.phone}</span>
                <span>{pickup.address}</span>
                <span>{new Date(pickup.scheduledDate).toLocaleDateString()} | {pickup.timeSlot}</span>
                <span>Status: {pickup.status}</span>
              </div>
              <div className="status-actions">
                <button type="button" onClick={() => handleStatus(pickup._id, "out-for-pickup")}>
                  Out for Pickup
                </button>
                <button type="button" onClick={() => handleStatus(pickup._id, "picked")}>
                  Picked
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CollectorDashboard;
