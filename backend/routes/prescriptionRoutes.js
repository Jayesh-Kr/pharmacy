const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getPrescriptions, getPrescriptionById, createPrescription, deletePrescription } = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const prescriptionValidation = [
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('doctor_id').isInt().withMessage('Valid doctor ID is required'),
  body('prescription_date').notEmpty().withMessage('Prescription date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine_id').isInt().withMessage('Valid medicine ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
];

router.use(authMiddleware);

router.get('/', getPrescriptions);
router.get('/:id', getPrescriptionById);
router.post('/', prescriptionValidation, createPrescription);
router.delete('/:id', roleMiddleware('admin'), deletePrescription);

module.exports = router;
