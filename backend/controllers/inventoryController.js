const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

// @desc    Get low stock medicines
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockMedicines = asyncHandler(async (req, res) => {
  const [medicines] = await db.query(`
    SELECT m.medicine_id, m.medicine_name, m.stock_quantity, m.reorder_level, s.supplier_name
    FROM medicines m
    JOIN suppliers s ON m.supplier_id = s.supplier_id
    WHERE m.stock_quantity <= m.reorder_level;
  `);
  res.json(medicines);
});

// @desc    Get medicines expiring within the next 30 days
// @route   GET /api/inventory/expiring
// @access  Private
const getExpiringMedicines = asyncHandler(async (req, res) => {
  const [medicines] = await db.query(`
    SELECT medicine_id, medicine_name, expiry_date, stock_quantity
    FROM medicines
    WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
  `);
  res.json(medicines);
});

module.exports = {
  getLowStockMedicines,
  getExpiringMedicines
};
