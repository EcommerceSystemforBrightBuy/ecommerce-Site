const pool = require('../config/db');

// 1. POST /api/orders — Call sp_checkout_order Stored Procedure
exports.createOrder = async (req, res) => {
    try {
        const {
            orderID,
            customerID,
            totalAmount,
            deliveryMode,
            addressId,
            cityId,
            paymentMethod,
            variantId,
            quantity,
            unitPrice
        } = req.body;

        const id = orderID || `ORD-${Date.now()}`;
        const custId = customerID || 'CUST001';
        const cId = cityId || 'CITY-HOUSTON'; // Default Houston (Main City)
        const vId = variantId || 'VAR001';
        const qty = quantity || 1;
        const price = unitPrice || totalAmount;
        const formattedDeliveryMode = (deliveryMode === 'pickup' || deliveryMode === 'Store Pickup')
            ? 'Store Pickup'
            : 'Standard Delivery';
        const formattedPaymentMethod = (paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery')
            ? 'Cash on Delivery'
            : 'Card Payment';

        // Call MySQL Stored Procedure
        await pool.query(
            `CALL sp_checkout_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                custId,
                totalAmount,
                formattedDeliveryMode,
                addressId || null,
                cId,
                formattedPaymentMethod,
                vId,
                qty,
                price
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Order created via stored procedure successfully!',
            orderID: id
        });
    } catch (error) {
        console.error('Checkout Stored Procedure Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// 2. GET /api/orders — Admin Dispatch Queue
exports.getAllOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT o.order_id, o.customer_id, o.order_date, o.order_status, o.total_amount,
                   d.delivery_mode, d.estimated_delivery_date, d.delivery_status, p.payment_method, p.payment_status
            FROM \`order\` o
            LEFT JOIN delivery d ON o.order_id = d.order_id
            LEFT JOIN payment p ON o.order_id = p.order_id
            ORDER BY o.order_date DESC
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 3. GET /api/orders/:id — Itemized Dispatch Sheet
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orderRows] = await pool.query(
            `SELECT o.*, d.delivery_mode, d.estimated_delivery_date, d.delivery_status, p.payment_method, p.payment_status
             FROM \`order\` o
             LEFT JOIN delivery d ON o.order_id = d.order_id
             LEFT JOIN payment p ON o.order_id = p.order_id
             WHERE o.order_id = ?`,
            [id]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const [itemRows] = await pool.query(
            `SELECT oi.*, pv.sku, p.title 
             FROM order_item oi
             JOIN product_variant pv ON oi.variant_id = pv.variant_id
             JOIN product p ON pv.product_id = p.product_id
             WHERE oi.order_id = ?`,
            [id]
        );

        res.json({
            success: true,
            order: orderRows[0],
            items: itemRows
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// 4. PUT /api/orders/:id/status — Admin Dispatch Update
exports.updateOrderStatus = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { status } = req.body;

        await connection.beginTransaction();

        // 1. Get current delivery status to check if already dispatched
        const [delRows] = await connection.query(
            `SELECT delivery_status FROM delivery WHERE order_id = ?`,
            [id]
        );

        const currentStatus = delRows.length > 0 ? delRows[0].delivery_status : null;

        // 2. Update delivery status
        await connection.query(
            `UPDATE delivery SET delivery_status = ? WHERE order_id = ?`,
            [status, id]
        );

        // Also sync order_status in order table
        const lowerStatus = (status || '').toLowerCase();
        if (lowerStatus === 'dispatched' || lowerStatus === 'shipped') {
            await connection.query(
                `UPDATE \`order\` SET order_status = 'shipped' WHERE order_id = ?`,
                [id]
            );
        } else if (lowerStatus === 'delivered') {
            await connection.query(
                `UPDATE \`order\` SET order_status = 'delivered' WHERE order_id = ?`,
                [id]
            );
        }

        // 3. Deduct inventory stock when status changes to dispatched/shipped/delivered for the first time
        const isDispatched = ['dispatched', 'shipped', 'delivered'].includes(lowerStatus);
        const wasDispatched = ['dispatched', 'shipped', 'delivered'].includes((currentStatus || '').toLowerCase());

        if (isDispatched && !wasDispatched) {
            // Fetch order items for this order
            const [items] = await connection.query(
                `SELECT variant_id, quantity FROM order_item WHERE order_id = ?`,
                [id]
            );

            // Deduct stock in inventory table for each item
            for (const item of items) {
                await connection.query(
                    `UPDATE inventory SET quantity_on_hand = quantity_on_hand - ? WHERE variant_id = ?`,
                    [item.quantity, item.variant_id]
                );
            }
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Order ${id} status updated to ${status} and inventory updated upon dispatch.`
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update Order Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
};

