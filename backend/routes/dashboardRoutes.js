const express = require('express');
const router = express.Router();
const { getDashboardStats, getSalesChartData, getTopMedicines } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// All dashboard routes are protected
router.use(authMiddleware);

router.get('/stats', getDashboardStats);
router.get('/sales-chart', getSalesChartData);
router.get('/top-medicines', getTopMedicines);

module.exports = router;
