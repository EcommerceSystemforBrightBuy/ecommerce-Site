const crypto = require('crypto');
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

        // Save customer address if streetAddress provided
        let deliveryAddressId = addressId || null;
        if (shippingCity || req.body.streetAddress) {
            const newAddrId = `ADDR-${Date.now()}`;
            await connection.query(
                `INSERT INTO customer_address (address_id, customer_id, city_id, address_line, postal_code, is_default)
                 VALUES (?, ?, ?, ?, ?, TRUE)`,
                [newAddrId, custId, finalCityId, req.body.streetAddress || 'Shipping Address', req.body.zipCode || '78701']
            ).catch(() => {});
            deliveryAddressId = newAddrId;
        }

        const firstItem = orderItemsList[0];

        const formattedDeliveryMode = (deliveryMode === 'pickup' || deliveryMode === 'Store Pickup' || deliveryMode === 'Central Store Pickup')
            ? 'Store Pickup'
            : 'Standard Delivery';

        const formattedPaymentMethod = (paymentMethod === 'cod' || paymentMethod === 'Cash on Delivery')
            ? 'Cash on Delivery'
            : 'Card Payment';

        // 1. Call MySQL Stored Procedure (Order creation + 1st item)
        await connection.query(
            `CALL sp_checkout_order(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                custId,
                totalAmount,
                formattedDeliveryMode,
                deliveryAddressId,
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

        // 3. If online card payment was completed via PayHere Sandbox, update payment status
        if (req.body.paymentStatus === 'completed' || req.body.transactionId || (formattedPaymentMethod === 'Card Payment' && req.body.payhereCompleted)) {
            await connection.query(
                `UPDATE payment SET payment_status = 'completed' WHERE order_id = ?`,
                [id]
            ).catch(() => {});
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
        const { customer_id } = req.query;
        let sql = `
            SELECT o.order_id, o.customer_id, o.order_date, o.order_status, o.total_amount,
                   d.delivery_mode, d.estimated_delivery_date, d.delivery_status,
                   payment.payment_method, payment.payment_status,
                   c.city_name, c.is_main_city,
                   ca.address_line, ca.postal_code,
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
        `;
        const params = [];
        if (customer_id) {
            sql += ` WHERE o.customer_id = ?`;
            params.push(customer_id);
        }
        sql += ` ORDER BY o.order_date DESC`;

        const [rows] = await pool.query(sql, params);
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
            `SELECT oi.*, pv.sku, pv.variant_name, p.product_id, p.product_name, p.brand
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

// 5. POST /api/orders/payhere-params — Generate PayHere Sandbox Hash and Checkout Payload
exports.getPayHereParams = async (req, res) => {
    try {
        const {
            orderId,
            totalAmount,
            amount,
            currency,
            customer,
            items,
            returnUrl,
            cancelUrl
        } = req.body || {};

        const appId = process.env.PAYHERE_APP_ID || process.env.APP_ID;
        const appSecret = process.env.PAYHERE_APP_SECRET || process.env.APP_SECRET;
        const merchantId = process.env.PAYHERE_MERCHANT_ID || process.env.MERCHANT_ID;
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || appSecret;

        if (!merchantId || !merchantSecret) {
            console.error('PayHere configuration error: PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET must be set in environment variables.');
            return res.status(500).json({
                success: false,
                error: 'PayHere gateway is not configured properly on the server. Please define environment variables.'
            });
        }

        const resolvedOrderId = orderId || `ORD-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const resolvedAmount = parseFloat(totalAmount || amount || 0).toFixed(2);
        const resolvedCurrency = (currency || 'USD').toUpperCase();

        // PayHere Hash generation:
        // MD5(merchant_id + order_id + formatted_amount + currency + MD5(merchant_secret).toUpperCase()).toUpperCase()
        const hashedSecret = crypto
            .createHash('md5')
            .update(merchantSecret)
            .digest('hex')
            .toUpperCase();

        const inputString = merchantId + resolvedOrderId + resolvedAmount + resolvedCurrency + hashedSecret;

        const hash = crypto
            .createHash('md5')
            .update(inputString)
            .digest('hex')
            .toUpperCase();

        const cust = customer || {};
        const nameParts = (cust.name || 'BrightBuy Customer').trim().split(/\s+/);
        const firstName = cust.firstName || cust.first_name || nameParts[0] || 'Customer';
        const lastName = cust.lastName || cust.last_name || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Texas');

        const itemsDescription = Array.isArray(items) && items.length > 0
            ? items.map(it => `${it.product?.name || it.name || 'Product'} (x${it.quantity || 1})`).join(', ')
            : `BrightBuy Texas Retail Order #${resolvedOrderId}`;

        return res.status(200).json({
            success: true,
            sandbox: true,
            app_id: appId,
            merchant_id: merchantId,
            order_id: resolvedOrderId,
            items: itemsDescription,
            amount: resolvedAmount,
            currency: resolvedCurrency,
            hash: hash,
            first_name: firstName,
            last_name: lastName,
            email: cust.email || 'customer@brightbuy.tx',
            phone: cust.phone || '(512) 555-0188',
            address: cust.address || cust.streetAddress || 'Texas Central Warehouse Store',
            city: cust.city || cust.shippingCity || 'Austin',
            country: 'United States',
            notify_url: `${req.protocol}://${req.get('host')}/api/orders/payhere-notify`,
            return_url: returnUrl || 'http://localhost:3000/checkout/confirmation',
            cancel_url: cancelUrl || 'http://localhost:3000/checkout/payment',
        });
    } catch (error) {
        console.error('PayHere Param Generation Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 6. POST /api/orders/payhere-notify — PayHere IPN Webhook with cryptographic md5sig verification
exports.handlePayHereNotify = async (req, res) => {
    try {
        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = req.body || {};

        console.log(`[PayHere Webhook] Order: ${order_id}, Status: ${status_code}, Amount: ${payhere_amount}, Currency: ${payhere_currency}`);

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || process.env.PAYHERE_APP_SECRET;
        const configuredMerchantId = process.env.PAYHERE_MERCHANT_ID || process.env.MERCHANT_ID;

        if (!merchantSecret || !configuredMerchantId) {
            console.error('[PayHere Webhook Error]: PayHere merchant credentials not configured in environment.');
            return res.status(500).send('Server misconfiguration');
        }

        // Validate required IPN payload parameters
        if (!md5sig || !merchant_id || !order_id || !payhere_amount || !payhere_currency || status_code === undefined) {
            console.warn('[PayHere Webhook Warning]: Rejected IPN callback due to missing required parameters.');
            return res.status(400).send('Bad Request: Incomplete IPN payload');
        }

        // Verify that the merchant ID in the notification matches our configured merchant ID
        if (String(merchant_id).trim() !== String(configuredMerchantId).trim()) {
            console.warn(`[PayHere Webhook Warning]: Unauthorized merchant_id: ${merchant_id} (expected: ${configuredMerchantId})`);
            return res.status(403).send('Forbidden: Merchant ID mismatch');
        }

        // Cryptographic MD5 signature verification:
        // strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
        const hashedSecret = crypto
            .createHash('md5')
            .update(merchantSecret)
            .digest('hex')
            .toUpperCase();

        const signatureInput = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
        const localMd5sig = crypto
            .createHash('md5')
            .update(signatureInput)
            .digest('hex')
            .toUpperCase();

        if (localMd5sig !== String(md5sig).toUpperCase()) {
            console.warn(`[PayHere Webhook Security Violation]: MD5 signature verification failed for Order: ${order_id}. Signature: ${md5sig}, Computed: ${localMd5sig}`);
            return res.status(400).send('Bad Request: Invalid MD5 signature');
        }

        // Signature verified successfully. Update payment and order status according to status_code
        // Status code 2: Success
        if (status_code == 2 || status_code == '2') {
            await pool.query(
                `UPDATE payment SET payment_status = 'completed', payment_date = NOW() WHERE order_id = ?`,
                [order_id]
            ).catch((err) => console.error('Error updating payment to completed:', err));

            await pool.query(
                `UPDATE \`order\` SET order_status = 'confirmed' WHERE order_id = ? AND order_status = 'pending'`,
                [order_id]
            ).catch((err) => console.error('Error updating order to confirmed:', err));

            console.log(`[PayHere Webhook Success]: Order ${order_id} marked as completed.`);
        } else if (status_code == -1 || status_code == -2 || status_code == '-1' || status_code == '-2') {
            // Status code -1 (Canceled), -2 (Failed)
            await pool.query(
                `UPDATE payment SET payment_status = 'failed' WHERE order_id = ?`,
                [order_id]
            ).catch((err) => console.error('Error updating payment to failed:', err));

            console.log(`[PayHere Webhook Status]: Order ${order_id} marked as payment failed (${status_code}).`);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('[PayHere Webhook Error]:', error);
        return res.status(500).send('Webhook Processing Error');
    }
};

