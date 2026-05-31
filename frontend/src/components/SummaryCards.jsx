import React from "react";
import { Coins, Leaf, PackageCheck } from "lucide-react";

function SummaryCards({ totals, user }) {
  return (
    <section className="summary-grid" aria-label="Pickup estimate summary">
      <Stat icon={<Coins />} label="Estimated value" value={`₹${Math.round(totals.amount)}`} />
      <Stat
        icon={<Leaf />}
        label={user ? "My Green Points" : "Green Points"}
        value={user ? user.greenPoints : Math.round(totals.points)}
      />
      <Stat icon={<PackageCheck />} label="Weight" value={`${totals.weight} kg`} />
    </section>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default SummaryCards;
