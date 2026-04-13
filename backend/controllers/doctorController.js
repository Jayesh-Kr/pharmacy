const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  const [doctors] = await db.query('SELECT * FROM doctors ORDER BY doctor_name ASC');
  res.json(doctors);
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const [doctors] = await db.execute('SELECT * FROM doctors WHERE doctor_id = ?', [req.params.id]);
  if (doctors.length === 0) {
    return res.status(404).json({ message: 'Doctor not found' });
  }
  res.json(doctors[0]);
});

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private (Admin/Pharmacist)
const createDoctor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { doctor_name, specialization, phone, license_number } = req.body;

  try {
    const [result] = await db.execute(
      `INSERT INTO doctors (doctor_name, specialization, phone, license_number) VALUES (?, ?, ?, ?)`,
      [doctor_name, specialization || null, phone || null, license_number || null]
    );
    res.status(201).json({ message: 'Doctor created successfully', doctor_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'License number already exists' });
    }
    throw error;
  }
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private (Admin/Pharmacist)
const updateDoctor = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { doctor_name, specialization, phone, license_number } = req.body;

  try {
    const [result] = await db.execute(
      `UPDATE doctors SET doctor_name = ?, specialization = ?, phone = ?, license_number = ? WHERE doctor_id = ?`,
      [doctor_name, specialization || null, phone || null, license_number || null, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'License number already exists' });
    }
    throw error;
  }
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin only)
const deleteDoctor = asyncHandler(async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM doctors WHERE doctor_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete doctor with existing prescriptions' });
    }
    throw error;
  }
});

module.exports = { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor };
