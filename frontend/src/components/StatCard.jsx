import React from 'react';

export function StatCard({ icon: Icon, title, value, hint }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-hint">{hint}</div>
      </div>
      <div className="stat-icon">{Icon ? <Icon size={18} /> : null}</div>
    </div>
  );
}
