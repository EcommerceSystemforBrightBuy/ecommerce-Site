const express = require('express');
const router = express.Router();
const {
    getQuarterlySales,
    getTopSelling,
    getCategoryOrders,
    getDeliveryEstimates,
    getCustomerSummary
} = require('./../controllers/reportController');

router.get('/quarterly-sales', getQuarterlySales);
router.get('/top-selling', getTopSelling);
router.get('/category-orders', getCategoryOrders);
router.get('/delivery-estimates', getDeliveryEstimates);
router.get('/customer-summary', getCustomerSummary);

module.exports = router;