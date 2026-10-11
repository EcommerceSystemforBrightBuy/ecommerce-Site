const express = require('express');
const router = express.Router();
const {
    createOrder,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    getPayHereParams,
    handlePayHereNotify
} = require('../controllers/orderController');

// Routes
router.post('/payhere-params', getPayHereParams);
router.post('/payhere-notify', handlePayHereNotify);
router.post('/', createOrder);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', updateOrderStatus);
module.exports = router;

