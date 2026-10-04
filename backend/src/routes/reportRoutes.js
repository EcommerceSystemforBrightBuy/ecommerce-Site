const express = require('express');
const router = express.Router();
const { getQuarterlySales } = require('./../controllers/reportController');

router.get('/quarterly-sales', getQuarterlySales);

module.exports = router;