const db = require('../config/db');
const { asyncHandler, formatValidationErrors, formatDateForMySQL } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = asyncHandler(async (req, res) => {
  const [customers] = await db.query('SELECT * FROM customers ORDER BY customer_name ASC');
  res.json(customers);
});

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = asyncHandler(async (req, res) => {
  const [customers] = await db.execute('SELECT * FROM customers WHERE customer_id = ?', [req.params.id]);
  if (customers.length === 0) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json(customers[0]);
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
const createCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { customer_name, phone, email, address, date_of_birth } = req.body;

  const [result] = await db.execute(
    `INSERT INTO customers (customer_name, phone, email, address, date_of_birth) VALUES (?, ?, ?, ?, ?)`,
    [customer_name, phone, email || null, address || null, formatDateForMySQL(date_of_birth) || null]
  );

  res.status(201).json({ message: 'Customer created successfully', customer_id: result.insertId });
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { customer_name, phone, email, address, date_of_birth } = req.body;

  const [result] = await db.execute(
    `UPDATE customers SET customer_name = ?, phone = ?, email = ?, address = ?, date_of_birth = ? WHERE customer_id = ?`,
    [customer_name, phone, email || null, address || null, formatDateForMySQL(date_of_birth) || null, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  res.json({ message: 'Customer updated successfully' });
});

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
const deleteCustomer = asyncHandler(async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Cannot delete customer with existing sales or prescriptions' });
    }
    throw error;
  }
});

module.exports = { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
