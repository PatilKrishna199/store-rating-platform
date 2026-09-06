const express = require('express');
const router = express.Router();

const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');

// Only normal users browse & rate stores this way (admins have their own
// read-only listing, store owners see their own dashboard instead).
router.use(authenticate, authorize('user'));

router.get('/', storeController.listStores);
router.post('/:id/rating', storeController.submitRating);

module.exports = router;
