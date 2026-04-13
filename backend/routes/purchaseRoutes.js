const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createPurchase, getPurchases, updatePurchaseStatus } = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const purchaseValidation = [
  body('supplier_id').isInt().withMessage('Valid supplier ID is required'),
  body('total_amount').isNumeric().withMessage('Total amount must be a number'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine_id').isInt().withMessage('Valid medicine ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unit_price').isNumeric().withMessage('Unit price must be a number'),
  body('items.*.subtotal').isNumeric().withMessage('Subtotal must be a number')
];

router.use(authMiddleware);

router.post('/', roleMiddleware('admin', 'pharmacist'), purchaseValidation, createPurchase);
router.get('/', getPurchases);
router.put('/:id/status', roleMiddleware('admin', 'pharmacist'), updatePurchaseStatus);

module.exports = router;
