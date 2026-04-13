const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getMedicines, 
  getMedicineById, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Validations
const medicineValidation = [
  body('medicine_name').notEmpty().withMessage('Medicine name is required'),
  body('purchase_price').isNumeric().withMessage('Purchase price must be a number'),
  body('selling_price').isNumeric().withMessage('Selling price must be a number'),
];

// All routes are protected
router.use(authMiddleware);

// Routes
router.get('/', getMedicines);
router.get('/:id', getMedicineById);

// Only Admin & Pharmacist can write
router.post('/', roleMiddleware('admin', 'pharmacist'), medicineValidation, createMedicine);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), medicineValidation, updateMedicine);
router.delete('/:id', roleMiddleware('admin'), deleteMedicine);

module.exports = router;
