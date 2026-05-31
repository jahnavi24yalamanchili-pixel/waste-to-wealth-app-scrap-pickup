import React from "react";

function SelectedScrap({ items, removeItem }) {
  return (
    <>
      <h3>Selected Scrap</h3>
      <div className="selected-list">
        {items.length === 0 ? (
          <p className="empty-text">No items added yet.</p>
        ) : (
          items.map((item, index) => (
            <div className="selected-row" key={`${item._id}-${index}`}>
              <div>
                <strong>{item.name}</strong>
                <span>{item.estimatedWeightKg} kg</span>
              </div>
              <button type="button" onClick={() => removeItem(index)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default SelectedScrap;
