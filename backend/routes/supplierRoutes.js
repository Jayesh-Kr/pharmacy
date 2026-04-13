const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getSuppliers, 
  getSupplierById, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier 
} = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Validations
const supplierValidation = [
  body('supplier_name').notEmpty().withMessage('Supplier name is required'),
  body('phone').notEmpty().withMessage('Phone is required')
];

// All routes are protected
router.use(authMiddleware);

// Routes
router.get('/', getSuppliers);
router.get('/:id', getSupplierById);

// Only Admin & Pharmacist can write
router.post('/', roleMiddleware('admin', 'pharmacist'), supplierValidation, createSupplier);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), supplierValidation, updateSupplier);
router.delete('/:id', roleMiddleware('admin'), deleteSupplier);

module.exports = router;
