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
        {materials.map((material) => (
          <div className="price-row" key={material._id}>
            <div>
              <strong>{material.name}</strong>
              <span>{material.category}</span>
            </div>
            <div className="rate">₹{material.pricePerKg}/kg</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default PriceList;
