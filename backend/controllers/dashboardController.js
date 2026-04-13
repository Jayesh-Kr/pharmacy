const db = require('../config/db');
const { asyncHandler } = require('../utils/helpers');

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const [stats] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM medicines) AS total_medicines,
      (SELECT COUNT(*) FROM customers) AS total_customers,
      (SELECT IFNULL(SUM(total_amount), 0) FROM sales WHERE DATE(sale_date) = CURDATE()) AS today_revenue,
      (SELECT COUNT(*) FROM medicines WHERE stock_quantity <= reorder_level) AS low_stock_count;
  `);

  res.json(stats[0]);
});

// @desc    Get daily sales chart data (last 7 days)
// @route   GET /api/dashboard/sales-chart
// @access  Private
const getSalesChartData = asyncHandler(async (req, res) => {
  const [data] = await db.query(`
    SELECT 
      DATE_FORMAT(sale_date, '%Y-%m-%d') AS sale_day, 
      SUM(total_amount) AS revenue, 
      COUNT(*) AS total_sales
    FROM sales
    WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    GROUP BY DATE(sale_date)
    ORDER BY sale_day ASC;
  `);

  res.json(data);
});

// @desc    Get top selling medicines
// @route   GET /api/dashboard/top-medicines
// @access  Private
const getTopMedicines = asyncHandler(async (req, res) => {
  const [data] = await db.query(`
    SELECT 
      m.medicine_name, 
      SUM(si.quantity) AS total_sold, 
      SUM(si.subtotal) AS revenue
    FROM sale_items si
    JOIN medicines m ON si.medicine_id = m.medicine_id
    GROUP BY si.medicine_id
    ORDER BY total_sold DESC
    LIMIT 5;
  `);

  res.json(data);
});

module.exports = {
  getDashboardStats,
  getSalesChartData,
  getTopMedicines
};
