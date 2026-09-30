const pool = require('../config/db');

// 1. CREATE: Insert a new order into database
exports.createOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { orderID, customerID, totalAmount, orderstatus,
            deliveryMode, addressId, paymentMethod, items } = req.body;
        const id = orderID || `ORD-${Date.now()}`;
        const status = orderstatus || 'confirmed';

        // 2. Start MySQL Transaction
        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO \`order\`(
            order_id,customer_id,total_amount,order_status)
            VALUES (?,?,?,?)`,
            [id, customerID, totalAmount, status]
        );


        //insert order items
        if (items && items.length > 0) {
            for (const item of items) {
                const itemID = `ITEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const subtotal = item.quantity * item.unitPrice;
                await connection.query(
                    `INSERT INTO order_item (order_item_id,order_id,variant_id,quantity,
                    unit_price,subtotal)
                    VALUES (?,?,?,?,?,?)`,
                    [itemID, id, item.variantId, item.quantity, item.unitPrice, subtotal]);
            }
        }

        // insert delivery details
        const deliveryId = `DEL-${Date.now()}`;
        const deliveryStatus = "pending";
        const mode = (deliveryMode === 'pickup' || deliveryMode === 'Store Pickup')
            ? 'Store Pickup'
            : 'Standard Delivery';
        await connection.query(`INSERT INTO delivery (delivery_id,
            order_id,delivery_mode,delivery_address_id,estimated_delivery_date,delivery_status)
            VALUES (?,?,?,?,DATE_ADD(NOW(),INTERVAL 3 DAY),?)`,
            [deliveryId, id, mode || 'Standard Delivery', addressId, deliveryStatus])


        // insert payment details
        const paymentID = `PAY-${Date.now()}`;
        const payStatus = paymentMethod === 'Card payment' ? 'completed' : 'pending';

        await connection.query(`INSERT INTO payment(payment_id,order_id,
            payment_method,payment_status,amount) value (?,?,?,?,?)`,
            [paymentID, id, paymentMethod, payStatus, totalAmount]);

        // commit the transaction if all complete

        await connection.commit();
        res.status(201).json({
            success: true,
            message: 'order created successfully!',
            orderID: id
        });
    } catch (error) {
        await connection.rollback();
        console.error('create order error:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        connection.release();
    }
};