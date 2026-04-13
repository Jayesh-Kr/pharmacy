const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  getCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Validations
const categoryValidation = [
  body('category_name').notEmpty().withMessage('Category name is required')
];

// All routes are protected
router.use(authMiddleware);

// Routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Only Admin & Pharmacist can write
router.post('/', roleMiddleware('admin', 'pharmacist'), categoryValidation, createCategory);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), categoryValidation, updateCategory);
router.delete('/:id', roleMiddleware('admin'), deleteCategory);

module.exports = router;
