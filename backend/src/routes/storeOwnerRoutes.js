const express = require('express');
const router = express.Router();

const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('store_owner'));

router.get('/dashboard', storeOwnerController.dashboard);

module.exports = router;
