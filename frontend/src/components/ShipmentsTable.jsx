import React from 'react';

const ShipmentsTable = ({ 
  shipments, 
  onEditShipment, 
  onDeleteShipment, 
  onStatusChange,
  paginationData, 
  currentPage, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const calculateDeliveryForecast = (shipment) => {
    const today = new Date();
    const estimatedDate = new Date(shipment.estimated_delivery_date);
    
    if (shipment.status === 'DELIVERED') {
      return { text: 'Delivered successfully', class: 'delivered' };
    }
    
    if (shipment.status !== 'DELIVERED' && today > estimatedDate) {
      return { text: 'Overdue', class: 'overdue' };
    }
    
    if (shipment.status === 'IN_TRANSIT' && today <= estimatedDate) {
      return { text: 'On schedule', class: 'on-schedule' };
    }
    
    if (shipment.status === 'DELAYED') {
      return { text: 'Delayed', class: 'overdue' };
    }
    
    return { text: 'Pending', class: 'on-schedule' };
  };

  if (shipments.length === 0) {
    return (
      <div className="table-container">
        <div className="no-data">
          <i className="fas fa-box-open"></i>
          <h3>No shipments found</h3>
          <p>Create your first shipment to get started</p>
        </div>
      </div>
    );
  }

  const renderPageNumbers = () => {
    const { totalPages } = paginationData;
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-number ${i === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="table-container">
      <table className="shipments-table">
        <thead>
          <tr>
            <th>Tracking Number</th>
            <th>Destination</th>
            <th>Status</th>
            <th>Ship Date</th>
            <th>Est. Delivery</th>
            <th>Fragile</th>
            <th>Forecast</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map(shipment => {
            const forecast = calculateDeliveryForecast(shipment);
            return (
              <tr key={shipment._id}>
                <td>
                  <strong>{shipment.tracking_number}</strong>
                </td>
                <td>{shipment.destination_address}</td>
                <td>
                  <span className={`status-badge ${shipment.status.toLowerCase().replace('_', '-')}`}>
                    {formatStatus(shipment.status)}
                  </span>
                </td>
                <td>{formatDate(shipment.ship_date)}</td>
                <td>{formatDate(shipment.estimated_delivery_date)}</td>
                <td>
                  {shipment.is_fragile ? (
                    <span className="fragile-badge">
                      <i className="fas fa-exclamation-triangle"></i> Fragile
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <span className={`forecast-text ${forecast.class}`}>
                    {forecast.text}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <select 
                      className="status-change-select"
                      value={shipment.status}
                      onChange={(e) => onStatusChange(shipment._id, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_TRANSIT">In Transit</option>
                      <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="DELAYED">Delayed</option>
                    </select>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => onEditShipment(shipment)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => onDeleteShipment(shipment._id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Pagination Controls */}
      {paginationData && paginationData.totalItems > 0 && (
        <div className="pagination-controls">
          <div className="pagination-info">
            <span>
              Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, paginationData.totalItems)} of {paginationData.totalItems} shipments
            </span>
          </div>
          <div className="pagination-buttons">
            <button
              className="pagination-btn"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <i className="fas fa-angle-left"></i>
            </button>
            <div className="page-numbers">
              {renderPageNumbers()}
            </div>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === paginationData.totalPages}
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              className="pagination-btn"
              onClick={() => onPageChange(paginationData.totalPages)}
              disabled={currentPage === paginationData.totalPages}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
          <div className="items-per-page">
            <label htmlFor="itemsPerPage">Items per page:</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(e.target.value)}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsTable;
