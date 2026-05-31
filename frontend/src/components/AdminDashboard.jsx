import React, { useEffect, useState } from "react";
import { assignCollector, getAllPickups, getCollectors, updatePickupStatus } from "../store/pickupStore";

function AdminDashboard({ token }) {
  const [pickups, setPickups] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [message, setMessage] = useState("");

  const loadData = () => {
    Promise.all([getAllPickups(token), getCollectors(token)])
      .then(([pickupData, collectorData]) => {
        setPickups(pickupData);
        setCollectors(collectorData);
      })
      .catch((error) => setMessage(error.message));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (pickupId, collectorId) => {
    try {
      await assignCollector(pickupId, collectorId, token);
      setMessage("Collector assigned.");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleStatus = async (pickupId, status) => {
    try {
      await updatePickupStatus(pickupId, status, token);
      setMessage("Pickup status updated.");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="panel dashboard-panel">
      <h2>Admin Pickup Management</h2>
      {message && <p className="message">{message}</p>}
      <div className="pickup-list">
        {pickups.map((pickup) => (
          <div className="pickup-card" key={pickup._id}>
            <div>
              <strong>{pickup.customer?.name}</strong>
              <span>{pickup.address}</span>
              <span>Status: {pickup.status}</span>
              <span>Green Points: {pickup.greenPoints}</span>
            </div>
            <select
              value={pickup.assignedCollector?._id || ""}
              onChange={(event) => handleAssign(pickup._id, event.target.value)}
            >
              <option value="">Assign collector</option>
              {collectors.map((collector) => (
                <option value={collector._id} key={collector._id}>
                  {collector.name} - {collector.vehicleNumber || "No vehicle"}
                </option>
              ))}
            </select>
            <div className="status-actions">
              <button type="button" onClick={() => handleStatus(pickup._id, "cancelled")}>
                Cancel
              </button>
              <button type="button" onClick={() => handleStatus(pickup._id, "picked")}>
                Mark Picked
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
