const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();
const itemController = require('../controllers/item.controller');


router.post('/create', authMiddleware, itemController.createItems);

module.exports = router;