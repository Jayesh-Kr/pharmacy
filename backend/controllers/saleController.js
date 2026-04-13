const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Create a new sale
// @route   POST /api/sales
// @access  Private
const createSale = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { customer_id, prescription_id, total_amount, discount, paid_amount, payment_method, items } = req.body;
  const created_by = req.user.username;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'At least one sale item is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert into sales table
    const [saleResult] = await conn.execute(
      `INSERT INTO sales (customer_id, prescription_id, total_amount, discount, paid_amount, payment_method, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, prescription_id || null, total_amount, discount || 0, paid_amount, payment_method || 'Cash', created_by]
    );
    const sale_id = saleResult.insertId;

    // 2. Insert into sale_items and update medicine stock (Trigger handles stock update)
    for (const item of items) {
       // Note: The database trigger 'trg_deduct_stock_after_sale' handles stock deduction
      await conn.execute(
        `INSERT INTO sale_items (sale_id, medicine_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [sale_id, item.medicine_id, item.quantity, item.unit_price, item.subtotal]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Sale completed successfully', sale_id });
  } catch (error) {
    await conn.rollback();
    console.error('Sale Transaction Error:', error);
    res.status(500).json({ message: 'Failed to process sale', error: error.message });
  } finally {
    conn.release();
  }
});

// @desc    Get all sales history
// @route   GET /api/sales
// @access  Private
const getSales = asyncHandler(async (req, res) => {
  const [sales] = await db.query(`
    SELECT s.*, c.customer_name 
    FROM sales s
    JOIN customers c ON s.customer_id = c.customer_id
    ORDER BY s.sale_date DESC
  `);
  res.json(sales);
});

// @desc    Get sale details and invoice
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = asyncHandler(async (req, res) => {
  const sale_id = req.params.id;

  // Get sale header
  const [sales] = await db.execute(`
    SELECT s.*, c.customer_name, c.phone, c.address
    FROM sales s
    JOIN customers c ON s.customer_id = c.customer_id
    WHERE s.sale_id = ?
  `, [sale_id]);

  if (sales.length === 0) {
    return res.status(404).json({ message: 'Sale record not found' });
  }

  // Get sale items
  const [items] = await db.execute(`
    SELECT si.*, m.medicine_name, m.unit
    FROM sale_items si
    JOIN medicines m ON si.medicine_id = m.medicine_id
    WHERE si.sale_id = ?
  `, [sale_id]);

  res.json({ ...sales[0], items });
});

module.exports = {
  createSale,
  getSales,
  getSaleById
};
