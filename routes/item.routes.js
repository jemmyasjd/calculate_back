const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();
const itemController = require('../controllers/item.controller');


router.post('/create', authMiddleware, itemController.createItems);
router.get('/analytics', authMiddleware, itemController.getAnalytics);
router.get('/today', authMiddleware, itemController.getTodayItems);
router.get('/week', authMiddleware, itemController.getThisWeekItems);
router.post('/by-date', authMiddleware, itemController.getItemsByDate);


module.exports = router;