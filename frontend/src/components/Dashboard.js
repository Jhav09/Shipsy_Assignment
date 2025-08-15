import React, { useState, useMemo, useEffect } from 'react';
import StatisticsGrid from './StatisticsGrid';
import ControlsPanel from './ControlsPanel';
import ShipmentsTable from './ShipmentsTable';
import ShipmentModal from './ShipmentModal';
import apiService from '../services/api';

const Dashboard = ({ user, onLogout, showToast }) => {
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('ship_date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch shipments from database
  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getShipments();
      if (response.success) {
        setShipments(response.data.shipments || []);
      } else {
        showToast('Failed to fetch shipments', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to fetch shipments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort shipments
  const filteredShipments = useMemo(() => {
    let filtered = [...shipments];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(shipment => 
        shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'ship_date') {
        return new Date(b.ship_date) - new Date(a.ship_date);
      } else if (sortBy === 'estimated_delivery_date') {
        return new Date(a.estimated_delivery_date) - new Date(b.estimated_delivery_date);
      } else if (sortBy === 'tracking_number') {
        return a.tracking_number.localeCompare(b.tracking_number);
      }
      return 0;
    });
    
    return filtered;
  }, [shipments, searchTerm, statusFilter, sortBy]);

  // Paginated shipments
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      shipments: filteredShipments.slice(startIndex, endIndex),
      totalItems: filteredShipments.length,
      totalPages: Math.ceil(filteredShipments.length / itemsPerPage)
    };
  }, [filteredShipments, currentPage, itemsPerPage]);

  const handleAddShipment = (newShipmentData) => {
    // Refresh shipments list after successful creation
    fetchShipments();
    setIsModalOpen(false);
    setEditingShipment(null);
  };

  const handleUpdateShipment = (updatedShipmentData) => {
    // Refresh shipments list after successful update
    fetchShipments();
    setIsModalOpen(false);
    setEditingShipment(null);
  };

  const handleDeleteShipment = async (shipmentId) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      try {
        const response = await apiService.deleteShipment(shipmentId);
        if (response.success) {
          showToast('Shipment deleted successfully!', 'success');
          fetchShipments(); // Refresh the list
        } else {
          showToast(response.message || 'Failed to delete shipment', 'error');
        }
      } catch (error) {
        showToast(error.message || 'Failed to delete shipment', 'error');
      }
    }
  };

  const handleStatusChange = async (shipmentId, newStatus) => {
    try {
      const response = await apiService.updateShipment(shipmentId, { status: newStatus });
      if (response.success) {
        const formatStatus = (status) => {
          return status.replace(/_/g, ' ').toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
        };
        
        showToast(`Status changed to ${formatStatus(newStatus)}`, 'success');
        fetchShipments(); // Refresh the list
      } else {
        showToast(response.message || 'Failed to update status', 'error');
      }
    } catch (error) {
      showToast(error.message || 'Failed to update status', 'error');
    }
  };

  const handleEditShipment = (shipment) => {
    setEditingShipment(shipment);
    setIsModalOpen(true);
  };

  const handleOpenModal = () => {
    setEditingShipment(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShipment(null);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (newStatusFilter) => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(parseInt(newItemsPerPage));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1><i className="fas fa-shipping-fast"></i> Shipment Manager</h1>
        </div>
        <div className="header-right">
          <span className="user-welcome">Welcome, {user.full_name || user.name}!</span>
          <button onClick={onLogout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </header>

      {/* Controls Panel */}
      <ControlsPanel
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onAddShipment={handleOpenModal}
      />

      {/* Statistics Grid */}
      <StatisticsGrid shipments={shipments} />

      {/* Shipments Table */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading shipments...</p>
        </div>
      ) : (
        <ShipmentsTable
          shipments={paginatedData.shipments}
          onEditShipment={handleEditShipment}
          onDeleteShipment={handleDeleteShipment}
          onStatusChange={handleStatusChange}
          paginationData={paginatedData}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}

      {/* Shipment Modal */}
      {isModalOpen && (
        <ShipmentModal
          shipment={editingShipment}
          onSave={editingShipment ? handleUpdateShipment : handleAddShipment}
          onClose={handleCloseModal}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default Dashboard;
