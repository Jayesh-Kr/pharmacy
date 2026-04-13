const express = require('express');
const router = express.Router();
const { getLowStockMedicines, getExpiringMedicines } = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/low-stock', getLowStockMedicines);
router.get('/expiring', getExpiringMedicines);

module.exports = router;
