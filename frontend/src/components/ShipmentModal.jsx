import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const ShipmentModal = ({ shipment, onSave, onClose, showToast }) => {
  const [formData, setFormData] = useState({
    tracking_number: '',
    destination_address: '',
    status: 'PENDING',
    is_fragile: false,
    ship_date: '',
    estimated_delivery_date: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (shipment) {
      setFormData({
        tracking_number: shipment.tracking_number || '',
        destination_address: shipment.destination_address || '',
        status: shipment.status || 'PENDING',
        is_fragile: shipment.is_fragile || false,
        ship_date: shipment.ship_date || '',
        estimated_delivery_date: shipment.estimated_delivery_date || '',
        notes: shipment.notes || ''
      });
    } else {
      // Set default dates for new shipment
      const today = new Date();
      const defaultDelivery = new Date();
      defaultDelivery.setDate(today.getDate() + 3);
      
      setFormData({
        tracking_number: '',
        destination_address: '',
        status: 'PENDING',
        is_fragile: false,
        ship_date: today.toISOString().split('T')[0],
        estimated_delivery_date: defaultDelivery.toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [shipment]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.estimated_delivery_date < formData.ship_date) {
      showToast('Estimated delivery date cannot be before ship date', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (shipment) {
        // Update existing shipment
        response = await apiService.updateShipment(shipment._id, formData);
      } else {
        // Create new shipment
        response = await apiService.createShipment(formData);
      }
      
      if (response.success) {
        showToast(shipment ? 'Shipment updated successfully!' : 'Shipment created successfully!', 'success');
        onSave(response.data);
        onClose();
      } else {
        showToast(response.message || 'Operation failed', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClick = (e) => {
    if (e.target.className === 'modal') {
      onClose();
    }
  };

  return (
    <div className="modal" onClick={handleModalClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{shipment ? 'Edit Shipment' : 'Add New Shipment'}</h3>
          <button onClick={onClose} className="close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="shipment-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tracking_number">Tracking Number *</label>
              <input
                type="text"
                id="tracking_number"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleInputChange}
                required
                placeholder="e.g., EKM100825KL"
              />
            </div>
            <div className="form-group">
              <label htmlFor="destination_address">Destination Address *</label>
              <input
                type="text"
                id="destination_address"
                name="destination_address"
                value={formData.destination_address}
                onChange={handleInputChange}
                required
                placeholder="e.g., Kochi, Kerala"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status *</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
              >
                <option value="PENDING">Pending</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_fragile"
                  checked={formData.is_fragile}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Fragile Package
              </label>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ship_date">Ship Date *</label>
              <input
                type="date"
                id="ship_date"
                name="ship_date"
                value={formData.ship_date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="estimated_delivery_date">Estimated Delivery Date *</label>
              <input
                type="date"
                id="estimated_delivery_date"
                name="estimated_delivery_date"
                value={formData.estimated_delivery_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Additional notes about the shipment..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Shipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShipmentModal;