const pool = require('../config/db');

// 1. CREATE: Insert a new order into database
exports.createOrder = async (req, res) => {
    try {
        const { orderID, customerID, totalAmount, orderstatus } = req.body;
        const id = orderID || `ORD-${Date.now()}`;
        const status = orderstatus || 'pending';
        const [result] = await pool.query(
            `INSERT INTO \`order\`(
            order_id,customer_id,total_amount,order_status)
            VALUES (?,?,?,?)`,
            [id, customerID, totalAmount, status]
        );

        res.status(201).json({
            success: true,
            message: 'order created successfully!',
            orderID: id
        });
    } catch (error) {
        console.error('create order error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};