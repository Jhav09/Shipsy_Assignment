const express = require('express');
const { body, validationResult } = require('express-validator');
const { Shipment } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all shipments for authenticated user
router.get('/', async (req, res) => {
  try {
    const { search, status, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 10 } = req.query;
    const userId = req.user.id;
    
    // Build query filter
    let filter = { user_id: userId };
    
    // Add search filter
    if (search) {
      filter.$or = [
        { tracking_number: { $regex: search, $options: 'i' } },
        { destination_address: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    
    // Build sort object
    const validSortFields = ['tracking_number', 'destination_address', 'status', 'ship_date', 'estimated_delivery_date', 'createdAt'];
    let sortObj = {};
    
    if (validSortFields.includes(sortBy)) {
      sortObj[sortBy] = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    } else {
      sortObj.createdAt = -1;
    }
    
    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Get shipments with pagination
    const shipments = await Shipment.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Get total count for pagination
    const totalItems = await Shipment.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        shipments,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalItems / limitNum),
          totalItems,
          itemsPerPage: limitNum
        }
      }
    });
    
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipments'
    });
  }
});

// Get single shipment
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const shipment = await Shipment.findOne({ _id: id, user_id: userId });
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.json({
      success: true,
      data: shipment
    });
    
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipment'
    });
  }
});

// Create new shipment
router.post('/', [
  body('tracking_number')
    .notEmpty()
    .withMessage('Tracking number is required')
    .isLength({ max: 50 })
    .withMessage('Tracking number must be less than 50 characters'),
  body('destination_address')
    .notEmpty()
    .withMessage('Destination address is required'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED'])
    .withMessage('Invalid status'),
  body('is_fragile')
    .optional()
    .isBoolean()
    .withMessage('is_fragile must be a boolean'),
  body('ship_date')
    .notEmpty()
    .withMessage('Ship date is required')
    .isISO8601()
    .withMessage('Ship date must be a valid date'),
  body('estimated_delivery_date')
    .notEmpty()
    .withMessage('Estimated delivery date is required')
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const {
      tracking_number,
      destination_address,
      status = 'PENDING',
      is_fragile = false,
      ship_date,
      estimated_delivery_date,
      notes = ''
    } = req.body;
    
    const userId = req.user.id;
    
    // Check if tracking number already exists
    const existingShipment = await Shipment.findOne({ tracking_number });
    
    if (existingShipment) {
      return res.status(409).json({
        success: false,
        message: 'Tracking number already exists'
      });
    }
    
    // Create new shipment
    const newShipment = new Shipment({
      user_id: userId,
      tracking_number,
      destination_address,
      status,
      is_fragile,
      ship_date,
      estimated_delivery_date,
      notes
    });
    
    const savedShipment = await newShipment.save();
    
    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: savedShipment
    });
    
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment'
    });
  }
});

// Update shipment
router.put('/:id', [
  body('tracking_number')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Tracking number must be less than 50 characters'),
  body('destination_address')
    .optional()
    .notEmpty()
    .withMessage('Destination address cannot be empty'),
  body('status')
    .optional()
    .isIn(['PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DELAYED'])
    .withMessage('Invalid status'),
  body('is_fragile')
    .optional()
    .isBoolean()
    .withMessage('is_fragile must be a boolean'),
  body('ship_date')
    .optional()
    .isISO8601()
    .withMessage('Ship date must be a valid date'),
  body('estimated_delivery_date')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid date'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if shipment exists and belongs to user
    const existingShipment = await Shipment.findOne({ _id: id, user_id: userId });
    
    if (!existingShipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    // Build update object
    const updateFields = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields[key] = req.body[key];
      }
    });
    
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    // Update shipment
    const updatedShipment = await Shipment.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: updatedShipment
    });
    
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shipment'
    });
  }
});

// Delete shipment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await Shipment.findOneAndDelete({ _id: id, user_id: userId });
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shipment'
    });
  }
});

// Get shipment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await Shipment.aggregate([
      { $match: { user_id: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'PENDING'] }, 1, 0] } },
          in_transit: { $sum: { $cond: [{ $eq: ['$status', 'IN_TRANSIT'] }, 1, 0] } },
          out_for_delivery: { $sum: { $cond: [{ $eq: ['$status', 'OUT_FOR_DELIVERY'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
          delayed: { $sum: { $cond: [{ $eq: ['$status', 'DELAYED'] }, 1, 0] } }
        }
      }
    ]);
    
    const result = stats.length > 0 ? stats[0] : {
      total: 0,
      pending: 0,
      in_transit: 0,
      out_for_delivery: 0,
      delivered: 0,
      delayed: 0
    };
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
