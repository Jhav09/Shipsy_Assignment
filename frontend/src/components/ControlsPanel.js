import React from 'react';

const ControlsPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  sortBy, 
  setSortBy, 
  onAddShipment 
}) => {
  return (
    <div className="controls-panel">
      <div className="search-section">
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by tracking number or destination..."
          />
        </div>
      </div>
      
      <div className="filter-section">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_TRANSIT">In Transit</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="DELAYED">Delayed</option>
        </select>
        
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="ship_date">Sort by Ship Date</option>
          <option value="estimated_delivery_date">Sort by Delivery Date</option>
          <option value="tracking_number">Sort by Tracking Number</option>
        </select>
        
        <button onClick={onAddShipment} className="add-btn">
          <i className="fas fa-plus"></i>
          New Shipment
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;
