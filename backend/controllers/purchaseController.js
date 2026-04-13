const db = require('../config/db');
const { asyncHandler, formatValidationErrors } = require('../utils/helpers');
const { validationResult } = require('express-validator');

// @desc    Create a new purchase order
// @route   POST /api/purchases
// @access  Private
const createPurchase = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: formatValidationErrors(errors.array()) });
  }

  const { supplier_id, total_amount, invoice_number, items } = req.body;
  const created_by = req.user.username;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'At least one purchase item is required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert into purchases table
    const [purchaseResult] = await conn.execute(
       `INSERT INTO purchases (supplier_id, total_amount, invoice_number, status, created_by) 
        VALUES (?, ?, ?, 'Pending', ?)`,
       [supplier_id, total_amount, invoice_number || null, created_by]
    );
    const purchase_id = purchaseResult.insertId;

    // 2. Insert into purchase_items
    for (const item of items) {
      await conn.execute(
        `INSERT INTO purchase_items (purchase_id, medicine_id, quantity, unit_price, subtotal, expiry_date) VALUES (?, ?, ?, ?, ?, ?)`,
        [purchase_id, item.medicine_id, item.quantity, item.unit_price, item.subtotal, item.expiry_date || null]
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Purchase order created successfully', purchase_id });
  } catch (error) {
    await conn.rollback();
    console.error('Purchase Transaction Error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Invoice number already exists' });
    }
    res.status(500).json({ message: 'Failed to create purchase order', error: error.message });
  } finally {
    conn.release();
  }
});

// @desc    Get all purchase orders
// @route   GET /api/purchases
// @access  Private
const getPurchases = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const [purchases] = await db.query(
    `
    SELECT p.*, s.supplier_name 
    FROM purchases p
    JOIN suppliers s ON p.supplier_id = s.supplier_id
    ${isAdmin ? '' : 'WHERE p.created_by = ?'}
    ORDER BY p.purchase_date DESC
  `,
    isAdmin ? [] : [req.user.username]
  );
  res.json(purchases);
});

// @desc    Update purchase status (Triggers stock update if status is 'Received')
// @route   PUT /api/purchases/:id/status
// @access  Private (Admin/Pharmacist)
const updatePurchaseStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const purchase_id = req.params.id;
  const isAdmin = req.user.role === 'admin';

    if (!['Pending', 'Received', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    // Check if current status is already 'Received'
  const [current] = await db.execute(
    `SELECT status, created_by FROM purchases WHERE purchase_id = ? ${isAdmin ? '' : 'AND created_by = ?'}`,
    isAdmin ? [purchase_id] : [purchase_id, req.user.username]
  );

    if (current.length === 0) {
        return res.status(404).json({ message: 'Purchase not found' });
    }

    if (current[0].status === 'Received' && status !== 'Received') {
        return res.status(400).json({ message: 'Cannot change status once it is marked as Received' });
    }

    // If changing to 'Received', apply stock update in transaction
    if (status === 'Received' && current[0].status !== 'Received') {
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          const [items] = await conn.execute(
            'SELECT medicine_id, quantity FROM purchase_items WHERE purchase_id = ?',
            [purchase_id]
          );

          for (const item of items) {
            await conn.execute(
              'UPDATE medicines SET stock_quantity = stock_quantity + ? WHERE medicine_id = ?',
              [item.quantity, item.medicine_id]
            );
          }

          await conn.execute('UPDATE purchases SET status = ? WHERE purchase_id = ?', ['Received', purchase_id]);
          await conn.commit();

          return res.json({ message: 'Purchase marked as Received and stock updated' });
        } catch (error) {
          await conn.rollback();
          console.error('Stock Update Transaction Error:', error);
          return res.status(500).json({ message: 'Failed to update stock from purchase', error: error.message });
        } finally {
          conn.release();
        }
    } else {
        // Just update the status normally (e.g. to 'Cancelled' or if it stays 'Pending')
        await db.execute('UPDATE purchases SET status = ? WHERE purchase_id = ?', [status, purchase_id]);
        res.json({ message: `Purchase status updated to ${status}` });
    }
});

module.exports = {
  createPurchase,
  getPurchases,
  updatePurchaseStatus
};
