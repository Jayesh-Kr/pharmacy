const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = asyncHandler(async (req, res) => {
  const [categories] = await db.query('SELECT * FROM categories ORDER BY category_name ASC');
  res.json(categories);
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = asyncHandler(async (req, res) => {
  const [categories] = await db.execute('SELECT * FROM categories WHERE category_id = ?', [req.params.id]);
  
  if (categories.length === 0) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(categories[0]);
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin/Pharmacist)
const createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { category_name, description } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO categories (category_name, description) VALUES (?, ?)',
      [category_name, description || null]
    );

    res.status(201).json({
      message: 'Category created successfully',
      category_id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    throw error;
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin/Pharmacist)
const updateCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { category_name, description } = req.body;

  try {
    const [result] = await db.execute(
      'UPDATE categories SET category_name = ?, description = ? WHERE category_id = ?',
      [category_name, description || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    throw error;
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM categories WHERE category_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Cannot delete category because it is linked to one or more medicines' 
      });
    }
    throw error;
  }
});

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
