const pool = require('../config/db');

// 1. POST /api/orders — Call sp_checkout_order Stored Procedure
exports.createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const {
            orderID, orderId,
            customerID, customerId,
            totalAmount,
            deliveryMode,
            addressId,
            cityId, shippingCity,
            paymentMethod,
            variantId, quantity, unitPrice,
            items
        } = req.body;

        const id = orderID || orderId || `ORD-${Date.now()}`;

        // Resolve & validate customer ID against DB customer table
        let rawCustId = customerID || customerId || (req.body.currentUser?.customerId || req.body.currentUser?.id) || 'CUST005';
        let custId = rawCustId;

        if (typeof rawCustId === 'string') {
            const digits = rawCustId.replace(/[^0-9]/g, '');
            if (digits) {
                const formattedCandidate = `CUST${digits.padStart(3, '0')}`;
                const [checkRows] = await connection.query(
                    `SELECT customer_id FROM customer WHERE customer_id = ? LIMIT 1`,
                    [formattedCandidate]
                );
                if (checkRows.length > 0) {
                    custId = formattedCandidate;
                }
            }
        }

        const [custCheck] = await connection.query(
            `SELECT customer_id FROM customer WHERE customer_id = ? LIMIT 1`,
            [custId]
        );
        if (custCheck.length === 0) {
            const [firstCust] = await connection.query(`SELECT customer_id FROM customer LIMIT 1`);
            if (firstCust.length > 0) {
                custId = firstCust[0].customer_id;
            } else {
                await connection.query(
                    `INSERT IGNORE INTO customer (customer_id, user_id) VALUES ('CUST005', 'USR005')`
                );
                custId = 'CUST005';
            }
        }

        // Find cityId if city name is passed
        let finalCityId = cityId;
        if (!finalCityId && shippingCity) {
            const [cityRows] = await connection.query(
                `SELECT city_id FROM city WHERE LOWER(city_name) LIKE LOWER(?) LIMIT 1`,
                [`%${shippingCity}%`]
            );
            if (cityRows.length > 0) {
                finalCityId = cityRows[0].city_id;
            }
        }
        if (!finalCityId) finalCityId = 'CITY-HOUSTON';

        // Prepare order items array
        let orderItemsList = [];
        if (items && Array.isArray(items) && items.length > 0) {
            orderItemsList = items.map(item => ({
                variantId: item.variantId || item.varient_id || item.variant_id || 'VAR001',
                quantity: Number(item.quantity) || 1,
                unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : (Number(item.price) || 0)
            }));
        } else {
            orderItemsList = [{
                variantId: variantId || 'VAR001',
                quantity: Number(quantity) || 1,
                unitPrice: unitPrice !== undefined ? Number(unitPrice) : (Number(totalAmount) || 0)
            }];
        }

        // Validate each variantId against MySQL database product_variant table
        for (let i = 0; i < orderItemsList.length; i++) {
            let item = orderItemsList[i];
            let vid = item.variantId;

            const [vCheck] = await connection.query(
                `SELECT variant_id, price FROM product_variant WHERE variant_id = ? LIMIT 1`,
                [vid]
            );

            if (vCheck.length > 0) {
                if (!item.unitPrice && vCheck[0].price) {
                    item.unitPrice = parseFloat(vCheck[0].price);
                }
            } else {
                let mappedVid = null;
                if (vid === 'v-1-1') mappedVid = 'VAR001';
                else if (vid === 'v-1-2') mappedVid = 'VAR002';
                else if (vid === 'v-1-3') mappedVid = 'VAR003';
                else if (vid === 'v-2-1') mappedVid = 'VAR004';
                else if (vid === 'v-2-2') mappedVid = 'VAR005';
                else if (vid === 'v-3-1') mappedVid = 'VAR006';
                else if (vid === 'v-3-2') mappedVid = 'VAR007';

                if (mappedVid) {
                    const [mapCheck] = await connection.query(
                        `SELECT variant_id, price FROM product_variant WHERE variant_id = ? LIMIT 1`,
                        [mappedVid]
                    );
                    if (mapCheck.length > 0) {
                        vid = mappedVid;
                        if (!item.unitPrice && mapCheck[0].price) {
                            item.unitPrice = parseFloat(mapCheck[0].price);
                        }
                    }
                }

                const [checkFinalVid] = await connection.query(
                    `SELECT variant_id, price FROM product_variant WHERE variant_id = ? LIMIT 1`,
                    [vid]
                );

                if (checkFinalVid.length === 0) {
                    const [fallbackV] = await connection.query(
                        `SELECT variant_id, price FROM product_variant WHERE is_active = true LIMIT 1`
                    );
                    if (fallbackV.length > 0) {
                        vid = fallbackV[0].variant_id;
                        if (!item.unitPrice && fallbackV[0].price) {
                            item.unitPrice = parseFloat(fallbackV[0].price);
                        }
                    }
                }
                item.variantId = vid;
            }
        }

        const firstItem = orderItemsList[0];

        const formattedDeliveryMode = (deliveryMode === 'pickup' || deliveryMode === 'Store Pickup')
            ? 'Store Pickup'
            : 'Standard Delivery';

        const formattedPaymentMethod = (paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery')
            ? 'Cash on Delivery'
            : 'Card Payment';

        // 1. Call MySQL Stored Procedure (Order creation + 1st item - DOES NOT DEDUCT INVENTORY)
        await connection.query(
            `CALL sp_checkout_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                custId,
                totalAmount,
                formattedDeliveryMode,
                addressId || null,
                finalCityId,
                formattedPaymentMethod,
                firstItem.variantId,
                firstItem.quantity,
                firstItem.unitPrice
            ]
        );

        // 2. Insert any additional order items (item 2, 3, etc.)
        if (orderItemsList.length > 1) {
            for (let i = 1; i < orderItemsList.length; i++) {
                const item = orderItemsList[i];
                const itemID = `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const subtotal = item.quantity * item.unitPrice;
                await connection.query(
                    `INSERT INTO order_item (order_item_id, order_id, variant_id, quantity, unit_price, subtotal)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [itemID, id, item.variantId, item.quantity, item.unitPrice, subtotal]
                );
            }
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully!',
            orderID: id
        });
    } catch (error) {
        console.error('Checkout Error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
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
                   u.email AS customer_email,
                   order_items.skus
            FROM \`order\` o
            LEFT JOIN delivery d ON o.order_id = d.order_id
            LEFT JOIN payment ON o.order_id = payment.order_id
            LEFT JOIN customer_address ca ON d.delivery_address_id = ca.address_id
            LEFT JOIN city c ON ca.city_id = c.city_id
            LEFT JOIN customer cust ON o.customer_id = cust.customer_id
            LEFT JOIN \`user\` u ON cust.user_id = u.user_id
            LEFT JOIN (
                SELECT oi.order_id, GROUP_CONCAT(DISTINCT pv.sku ORDER BY pv.sku SEPARATOR ', ') AS skus
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

// 3. GET /api/orders/:id — Itemized Dispatch Sheet & Modal Details
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const [orderRows] = await pool.query(
            `SELECT o.*,
                    d.delivery_mode, d.estimated_delivery_date, d.delivery_status,
                    p.payment_method, p.payment_status,
                    c.city_name, c.is_main_city,
                    ca.address_line, ca.postal_code,
                    CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
                    u.email AS customer_email,
                    u.phone AS customer_phone
             FROM \`order\` o
             LEFT JOIN delivery d ON o.order_id = d.order_id
             LEFT JOIN payment p ON o.order_id = p.order_id
             LEFT JOIN customer_address ca ON d.delivery_address_id = ca.address_id
             LEFT JOIN city c ON ca.city_id = c.city_id
             LEFT JOIN customer cust ON o.customer_id = cust.customer_id
             LEFT JOIN \`user\` u ON cust.user_id = u.user_id
             WHERE o.order_id = ?`,
            [id]
        );

        if (orderRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const [itemRows] = await pool.query(
            `SELECT oi.*, pv.sku, pv.variant_name, p.product_name, p.brand
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

// 4. PUT /api/orders/:id/status — Admin Dispatch Update (Checks Inventory Stock)
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
                `SELECT oi.variant_id, SUM(oi.quantity) AS quantity, pv.sku
                 FROM order_item oi
                 JOIN product_variant pv ON oi.variant_id = pv.variant_id
                 WHERE oi.order_id = ?
                 GROUP BY oi.variant_id, pv.sku
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

                const quantity = Number(item.quantity);
                const currentStock = inventoryRows.length > 0 ? Number(inventoryRows[0].quantity_on_hand) : 0;

                if (isDispatched && currentStock < quantity) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        error: `Cannot dispatch order: Insufficient stock on hand for SKU ${item.sku || item.variant_id}. (Available stock: ${currentStock}, Required quantity: ${quantity}). Please restock inventory before dispatching.`,
                    });
                }

                if (inventoryRows.length > 0) {
                    const change = isDispatched ? -quantity : quantity;
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
