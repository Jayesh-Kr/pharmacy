const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createSale, getSales, getSaleById } = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware');

const saleValidation = [
  body('customer_id').isInt().withMessage('Valid customer ID is required'),
  body('total_amount').isNumeric().withMessage('Total amount must be a number'),
  body('paid_amount').isNumeric().withMessage('Paid amount must be a number'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.medicine_id').isInt().withMessage('Valid medicine ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('items.*.unit_price').isNumeric().withMessage('Unit price must be a number'),
  body('items.*.subtotal').isNumeric().withMessage('Subtotal must be a number')
];

router.use(authMiddleware);

router.post('/', saleValidation, createSale);
router.get('/', getSales);
router.get('/:id', getSaleById);

module.exports = router;
