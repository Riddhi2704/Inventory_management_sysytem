const express = require('express');
const router = express.Router();
const { getMovementLogs, recordMovement } = require('../controllers/logController');
const { protect, authorize } = require('../middleware/auth');

router.route('/movement')
  .get(protect, authorize('Manager', 'Admin'), getMovementLogs)
  .post(protect, authorize('Staff', 'Manager', 'Admin'), recordMovement);

module.exports = router;
