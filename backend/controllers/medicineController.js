const db = require('../config/db');
const { asyncHandler, formatValidationErrors, formatDateForMySQL } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = asyncHandler(async (req, res) => {
  const [medicines] = await db.query(`
    SELECT m.*, c.category_name, s.supplier_name 
    FROM medicines m
    LEFT JOIN categories c ON m.category_id = c.category_id
    LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
    ORDER BY m.medicine_name ASC
  `);
  res.json(medicines);
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
const getMedicineById = asyncHandler(async (req, res) => {
  const [medicines] = await db.execute(`
    SELECT m.*, c.category_name, s.supplier_name 
    FROM medicines m
    LEFT JOIN categories c ON m.category_id = c.category_id
    LEFT JOIN suppliers s ON m.supplier_id = s.supplier_id
    WHERE m.medicine_id = ?
  `, [req.params.id]);

  if (medicines.length === 0) {
    return res.status(404).json({ message: 'Medicine not found' });
  }
  res.json(medicines[0]);
});

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Admin/Pharmacist)
const createMedicine = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const {
    medicine_name, generic_name, category_id, supplier_id, unit,
    purchase_price, selling_price, stock_quantity, reorder_level,
    expiry_date, description
  } = req.body;

  const [result] = await db.execute(
    `INSERT INTO medicines (
      medicine_name, generic_name, category_id, supplier_id, unit,
      purchase_price, selling_price, stock_quantity, reorder_level,
      expiry_date, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      medicine_name, generic_name || null, category_id || null, supplier_id || null, unit || null,
      purchase_price, selling_price, stock_quantity || 0, reorder_level || 10,
      formatDateForMySQL(expiry_date) || null, description || null
    ].map(v => v === undefined ? null : v)
  );

  res.status(201).json({
    message: 'Medicine created successfully',
    medicine_id: result.insertId
  });
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin/Pharmacist)
const updateMedicine = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const medicineId = req.params.id;

  // Check if exists
  const [exists] = await db.execute('SELECT medicine_id FROM medicines WHERE medicine_id = ?', [medicineId]);
  if (exists.length === 0) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  const {
    medicine_name, generic_name, category_id, supplier_id, unit,
    purchase_price, selling_price, stock_quantity, reorder_level,
    expiry_date, description
  } = req.body;

  await db.execute(
    `UPDATE medicines SET 
      medicine_name = ?, generic_name = ?, category_id = ?, supplier_id = ?, unit = ?,
      purchase_price = ?, selling_price = ?, stock_quantity = ?, reorder_level = ?,
      expiry_date = ?, description = ?
    WHERE medicine_id = ?`,
    [
      medicine_name, generic_name || null, category_id || null, supplier_id || null, unit || null,
      purchase_price, selling_price, stock_quantity || 0, reorder_level || 10,
      formatDateForMySQL(expiry_date) || null, description || null,
      medicineId
    ].map(v => v === undefined ? null : v)
  );

  res.json({ message: 'Medicine updated successfully' });
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin only)
const deleteMedicine = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM medicines WHERE medicine_id = ?', [req.params.id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Medicine not found' });
  }

  res.json({ message: 'Medicine deleted successfully' });
});

module.exports = {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
};
