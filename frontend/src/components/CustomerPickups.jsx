import React, { useEffect, useState } from "react";
import { getMyPickups } from "../store/pickupStore";

function CustomerPickups({ onRefreshUser, token, refreshKey }) {
  const [pickups, setPickups] = useState([]);

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

    return pickup.status;
  };

  const loadPickups = () => {
    getMyPickups(token).then(setPickups).catch(() => setPickups([]));
  };

  useEffect(() => {
    loadPickups();
  }, [token, refreshKey]);

  return (
    <div className="panel dashboard-panel">
      <div className="panel-title-row">
        <h2>My Pickups</h2>
        <button
          type="button"
          className="secondary-btn"
          onClick={() => {
            loadPickups();
            onRefreshUser();
          }}
        >
          Refresh
        </button>
      </div>
      <div className="pickup-list">
        {pickups.length === 0 ? (
          <p className="empty-text">No pickups scheduled yet.</p>
        ) : (
          pickups.map((pickup) => (
            <div className="pickup-card" key={pickup._id}>
              <div>
                <strong>{statusText(pickup)}</strong>
                <span>{pickup.address}</span>
                <span>
                  Pickup time: {new Date(pickup.scheduledDate).toLocaleDateString()} | {pickup.timeSlot}
                </span>
                <span>Amount: ₹{pickup.estimatedAmount}</span>
                <span>Green Points: {pickup.greenPoints}</span>
                {pickup.assignedCollector && (
                  <span>
                    Collector: {pickup.assignedCollector.name} ({pickup.assignedCollector.phone})
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CustomerPickups;
