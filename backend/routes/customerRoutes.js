const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const customerValidation = [
  body('customer_name').notEmpty().withMessage('Customer name is required'),
  body('phone').notEmpty().withMessage('Phone is required')
];

router.use(authMiddleware);

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', customerValidation, createCustomer);
router.put('/:id', customerValidation, updateCustomer);
router.delete('/:id', roleMiddleware('admin'), deleteCustomer);

module.exports = router;
