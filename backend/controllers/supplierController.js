const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const [suppliers] = await db.query('SELECT * FROM suppliers ORDER BY supplier_name ASC');
  res.json(suppliers);
});

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplierById = asyncHandler(async (req, res) => {
  const [suppliers] = await db.execute('SELECT * FROM suppliers WHERE supplier_id = ?', [req.params.id]);
  
  if (suppliers.length === 0) {
    return res.status(404).json({ message: 'Supplier not found' });
  }
  res.json(suppliers[0]);
});

// @desc    Create new supplier
// @route   POST /api/suppliers
// @access  Private (Admin/Pharmacist)
const createSupplier = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { supplier_name, contact_person, phone, email, address, city } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, city) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        supplier_name, 
        contact_person || null, 
        phone, 
        email || null, 
        address || null, 
        city || null
      ]
    );

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier_id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Supplier email already exists' });
    }
    throw error;
  }
});

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin/Pharmacist)
const updateSupplier = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { supplier_name, contact_person, phone, email, address, city } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE suppliers SET 
        supplier_name = ?, contact_person = ?, phone = ?, 
        email = ?, address = ?, city = ? 
       WHERE supplier_id = ?`,
      [
        supplier_name, 
        contact_person || null, 
        phone, 
        email || null, 
        address || null, 
        city || null,
        req.params.id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Supplier email already exists' });
    }
    throw error;
  }
});

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin only)
const deleteSupplier = asyncHandler(async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM suppliers WHERE supplier_id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Cannot delete supplier because it is linked to one or more medicines or purchases' 
      });
    }
    throw error;
  }
});

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};
