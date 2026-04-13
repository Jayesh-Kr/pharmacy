const db = require('../config/db');
const { asyncHandler, formatValidationErrors, formatDateForMySQL } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all prescriptions
// @route   GET /api/prescriptions
// @access  Private
const getPrescriptions = asyncHandler(async (req, res) => {
  const [prescriptions] = await db.query(`
    SELECT p.*, c.customer_name, c.phone AS customer_phone, d.doctor_name, d.specialization
    FROM prescriptions p
    JOIN customers c ON p.customer_id = c.customer_id
    JOIN doctors d ON p.doctor_id = d.doctor_id
    ORDER BY p.created_at DESC
  `);
  res.json(prescriptions);
});

// @desc    Get single prescription with items
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = asyncHandler(async (req, res) => {
  // Get prescription header
  const [prescriptions] = await db.execute(`
    SELECT p.*, c.customer_name, c.phone AS customer_phone, c.address,
           d.doctor_name, d.specialization, d.license_number
    FROM prescriptions p
    JOIN customers c ON p.customer_id = c.customer_id
    JOIN doctors d ON p.doctor_id = d.doctor_id
    WHERE p.prescription_id = ?
  `, [req.params.id]);

  if (prescriptions.length === 0) {
    return res.status(404).json({ message: 'Prescription not found' });
  }

  // Get prescription items
  const [items] = await db.execute(`
    SELECT pi.*, m.medicine_name, m.generic_name, m.unit
    FROM prescription_items pi
    JOIN medicines m ON pi.medicine_id = m.medicine_id
    WHERE pi.prescription_id = ?
  `, [req.params.id]);

  res.json({ ...prescriptions[0], items });
});

// @desc    Create new prescription with items
// @route   POST /api/prescriptions
// @access  Private
const createPrescription = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { customer_id, doctor_id, prescription_date, notes, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'At least one prescription item is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Insert prescription header
    const [result] = await conn.execute(
      `INSERT INTO prescriptions (customer_id, doctor_id, prescription_date, notes) VALUES (?, ?, ?, ?)`,
      [customer_id, doctor_id, formatDateForMySQL(prescription_date), notes || null]
    );
    const prescription_id = result.insertId;

    // Insert each item
    for (const item of items) {
      await conn.execute(
        `INSERT INTO prescription_items (prescription_id, medicine_id, dosage, quantity, duration_days) VALUES (?, ?, ?, ?, ?)`,
        [
          prescription_id,
          item.medicine_id,
          item.dosage || null,
          item.quantity,
          item.duration_days || null
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Prescription created successfully', prescription_id });
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

// @desc    Delete prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Admin only)
const deletePrescription = asyncHandler(async (req, res) => {
  const [result] = await db.execute('DELETE FROM prescriptions WHERE prescription_id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Prescription not found' });
  }
  res.json({ message: 'Prescription deleted successfully' });
});

module.exports = { getPrescriptions, getPrescriptionById, createPrescription, deletePrescription };
