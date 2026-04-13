const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getUsers, createUser, updateUser } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const userValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('role').isIn(['admin', 'pharmacist', 'cashier']).withMessage('Invalid role')
];

// All user routes are Admin only
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', getUsers);
router.post('/', userValidation, createUser);
router.put('/:id', updateUser);

module.exports = router;
