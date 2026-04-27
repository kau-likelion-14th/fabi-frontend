import React from "react";

function StatCard({ stats }) {
  return (
    <div className="stat-card">
        <span className="stat-icon">{stats.icon}</span>
        <span className="stat-title">{stats.title}</span>
      <div>
        <span className="stat-number">{stats.statistics.value}</span>
        <span>{stats.statistics.unit}</span>
      </div>
    </div>
  );
}

export default StatCard;