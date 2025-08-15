import React from 'react';

const StatisticsGrid = ({ shipments }) => {
  const stats = {
    pending: shipments.filter(s => s.status === 'PENDING').length,
    inTransit: shipments.filter(s => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length,
    delivered: shipments.filter(s => s.status === 'DELIVERED').length,
    delayed: shipments.filter(s => s.status === 'DELAYED').length
  };

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon pending">
          <i className="fas fa-clock"></i>
        </div>
        <div className="stat-info">
          <h3>{stats.pending}</h3>
          <p>Pending</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon in-transit">
          <i className="fas fa-truck"></i>
        </div>
        <div className="stat-info">
          <h3>{stats.inTransit}</h3>
          <p>In Transit</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon delivered">
          <i className="fas fa-check-circle"></i>
        </div>
        <div className="stat-info">
          <h3>{stats.delivered}</h3>
          <p>Delivered</p>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon delayed">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <div className="stat-info">
          <h3>{stats.delayed}</h3>
          <p>Delayed</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsGrid;
