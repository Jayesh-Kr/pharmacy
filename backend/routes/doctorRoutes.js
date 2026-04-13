const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getDoctors, getDoctorById, createDoctor, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const doctorValidation = [
  body('doctor_name').notEmpty().withMessage('Doctor name is required')
];

router.use(authMiddleware);

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.post('/', roleMiddleware('admin', 'pharmacist'), doctorValidation, createDoctor);
router.put('/:id', roleMiddleware('admin', 'pharmacist'), doctorValidation, updateDoctor);
router.delete('/:id', roleMiddleware('admin'), deleteDoctor);

module.exports = router;
