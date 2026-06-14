import React from "react";
import { CalendarClock } from "lucide-react";

function PickupForm({
  addItem,
  estimatedWeightKg,
  form,
  handleChange,
  isSubmitting,
  materials,
  message,
  selectedMaterial,
  setEstimatedWeightKg,
  setSelectedMaterial,
  submitPickup,
}) {
  const hasMaterials = materials.length > 0;

  return (
    <div className="panel">
      <div className="panel-heading">
        <CalendarClock size={22} />
        <h2>Schedule Pickup</h2>
      </div>

      <form onSubmit={submitPickup} className="pickup-form">
        <label className="full-width">
          Address
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Pickup address"
            rows="3"
            required
          />
        </label>

        <label>
          Date
          <input
            type="date"
            name="scheduledDate"
            value={form.scheduledDate}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Time Slot
          <select name="timeSlot" value={form.timeSlot} onChange={handleChange}>
            <option>09:00 AM - 12:00 PM</option>
            <option>12:00 PM - 03:00 PM</option>
            <option>03:00 PM - 06:00 PM</option>
          </select>
        </label>

        <div className="scrap-adder full-width">
          <label>
            Material
            <select
              value={selectedMaterial}
              onChange={(event) => setSelectedMaterial(event.target.value)}
              disabled={!hasMaterials}
            >
              {!hasMaterials && <option value="">No materials available</option>}
              {materials.map((material) => (
                <option value={material._id} key={material._id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Weight (kg)
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={estimatedWeightKg}
              onChange={(event) => setEstimatedWeightKg(event.target.value)}
            />
          </label>

          <button
            type="button"
            className="secondary-btn"
            onClick={addItem}
            disabled={!hasMaterials}
          >
            Add Item
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        <button className="primary-btn full-width" disabled={isSubmitting || !hasMaterials}>
          {isSubmitting ? "Scheduling..." : "Schedule Pickup"}
        </button>
      </form>
    </div>
  );
}

export default PickupForm;
