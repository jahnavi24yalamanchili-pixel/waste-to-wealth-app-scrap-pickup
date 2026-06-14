import React from "react";
import { MapPin } from "lucide-react";

function PriceList({ materials }) {
  return (
    <>
      <div className="panel-heading">
        <MapPin size={22} />
        <h2>Price List</h2>
      </div>

      <div className="price-list">
        {materials.length === 0 ? (
          <p className="empty-text">Live prices are not available right now.</p>
        ) : (
          materials.map((material) => (
            <div className="price-row" key={material._id}>
              <div>
                <strong>{material.name}</strong>
                <span>{material.category}</span>
              </div>
              <div className="rate">Rs. {material.pricePerKg}/kg</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default PriceList;
