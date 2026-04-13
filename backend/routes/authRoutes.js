const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Validations
const loginValidation = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/login', loginValidation, login);
router.get('/me', authMiddleware, getMe);

module.exports = router;
