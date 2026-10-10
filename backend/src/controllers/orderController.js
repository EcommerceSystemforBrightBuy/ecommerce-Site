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
                   d.delivery_mode, d.estimated_delivery_date, d.delivery_status,
                   payment.payment_method, payment.payment_status,
                   c.city_name, c.is_main_city,
                   CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                   order_items.skus
            FROM \`order\` o
            LEFT JOIN delivery d ON o.order_id = d.order_id
            LEFT JOIN payment ON o.order_id = payment.order_id
            LEFT JOIN customer_address ca ON d.delivery_address_id = ca.address_id
            LEFT JOIN city c ON ca.city_id = c.city_id
            LEFT JOIN customer cust ON o.customer_id = cust.customer_id
            LEFT JOIN \`user\` u ON cust.user_id = u.user_id
            LEFT JOIN (
                SELECT oi.order_id, GROUP_CONCAT(DISTINCT pv.sku ORDER BY pv.sku) AS skus
                FROM order_item oi
                JOIN product_variant pv ON oi.variant_id = pv.variant_id
                GROUP BY oi.order_id
            ) order_items ON o.order_id = order_items.order_id
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
            `SELECT oi.*, pv.sku, p.product_name
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
    const { id } = req.params;
    const requestedStatus = String(req.body?.status || '').toLowerCase();
    const allowedStatuses = ['pending', 'dispatched', 'delivered', 'failed'];

    if (!allowedStatuses.includes(requestedStatus)) {
        return res.status(400).json({ success: false, error: 'Invalid delivery status.' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [delRows] = await connection.query(
            `SELECT delivery_status FROM delivery WHERE order_id = ? FOR UPDATE`,
            [id]
        );

        if (delRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Order delivery not found.' });
        }

        const currentStatus = delRows[0].delivery_status;
        const wasDispatched = ['dispatched', 'delivered', 'failed'].includes(currentStatus);
        const isDispatched = ['dispatched', 'delivered', 'failed'].includes(requestedStatus);

        if (isDispatched !== wasDispatched) {
            const [items] = await connection.query(
                `SELECT oi.variant_id, SUM(oi.quantity) AS quantity
                 FROM order_item oi
                 WHERE oi.order_id = ?
                 GROUP BY oi.variant_id
                 ORDER BY oi.variant_id`,
                [id]
            );

            for (const item of items) {
                const [inventoryRows] = await connection.query(
                    `SELECT inventory_id, quantity_on_hand
                     FROM inventory
                     WHERE variant_id = ?
                     FOR UPDATE`,
                    [item.variant_id]
                );

                if (inventoryRows.length === 0) {
                    throw new Error(`Inventory row missing for variant ${item.variant_id}.`);
                }

                const quantity = Number(item.quantity);
                const change = isDispatched ? -quantity : quantity;
                if (isDispatched && Number(inventoryRows[0].quantity_on_hand) < quantity) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        error: `Insufficient stock for variant ${item.variant_id}.`,
                    });
                }

                await connection.query(
                    `UPDATE inventory
                     SET quantity_on_hand = quantity_on_hand + ?
                     WHERE variant_id = ?`,
                    [change, item.variant_id]
                );
                await connection.query(
                    `INSERT INTO inventory_transaction
                     (transaction_id, inventory_id, order_id, transaction_type, quantity_change)
                     VALUES (UUID(), ?, ?, ?, ?)`,
                    [
                        inventoryRows[0].inventory_id,
                        id,
                        isDispatched ? 'order_deduction' : 'return',
                        change,
                    ]
                );
            }
        }

        await connection.query(
            `UPDATE delivery SET delivery_status = ? WHERE order_id = ?`,
            [requestedStatus, id]
        );

        const orderStatus = requestedStatus === 'dispatched'
            ? 'shipped'
            : requestedStatus === 'delivered'
                ? 'delivered'
                : requestedStatus === 'pending'
                    ? 'pending'
                    : null;
        if (orderStatus) {
            await connection.query(
                `UPDATE \`order\` SET order_status = ? WHERE order_id = ?`,
                [orderStatus, id]
            );
        }

        await connection.commit();

        res.json({
            success: true,
            message: `Order ${id} status updated to ${requestedStatus}.`
        });
    } catch (error) {
        await connection.rollback();
        console.error('Update Order Status Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
};
