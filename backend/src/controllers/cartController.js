const { randomUUID } = require('crypto');
const pool = require('../config/db');

// One cart per customer (cart id is derived from the customer id, so it can't be duplicated).
// A cart_item row gets a random id; the UNIQUE (cart_id, variant_id) key in the database
// guarantees a variant can only appear once per cart, and ON DUPLICATE KEY UPDATE adds to it.
const cartIdFor = (customerId) => `CART-${customerId}`;
const newItemId = () => `CI-${randomUUID()}`;

const MAX_QTY = 99;
const validQty = (q) => Number.isInteger(q) && q >= 1 && q <= MAX_QTY;

// Make sure the customer exists and has a cart row. Returns the cart id or null if the customer is unknown.
const ensureCart = async (db, customerId) => {
    const [cust] = await db.query('SELECT customer_id FROM customer WHERE customer_id = ?', [customerId]);
    if (cust.length === 0) return null;

    const cartId = cartIdFor(customerId);
    await db.query('INSERT IGNORE INTO cart (cart_id, customer_id) VALUES (?, ?)', [cartId, customerId]);
    return cartId;
};

// Reads the cart in the exact shape the frontend cart uses.
const readCart = async (db, customerId) => {
    const [rows] = await db.query(
        `SELECT ci.variant_id, ci.quantity,
                pv.sku, pv.variant_name, pv.price,
                p.product_id, p.product_name, p.image_url,
                COALESCE(i.quantity_on_hand, 0) AS stock
         FROM cart c
         JOIN cart_item ci       ON ci.cart_id = c.cart_id
         JOIN product_variant pv ON pv.variant_id = ci.variant_id
         JOIN product p          ON p.product_id = pv.product_id
         LEFT JOIN inventory i   ON i.variant_id = pv.variant_id
         WHERE c.customer_id = ?
         ORDER BY ci.added_at, ci.cart_item_id`,
        [customerId]
    );

    return rows.map((r) => ({
        product: { id: r.product_id, name: r.product_name, image: r.image_url },
        variant: {
            id: r.variant_id,
            name: r.variant_name,
            sku: r.sku,
            price: parseFloat(r.price),
            stock: r.stock,
        },
        quantity: r.quantity,
    }));
};

// GET /api/cart/:customerId
exports.getCart = async (req, res) => {
    try {
        const { customerId } = req.params;
        const cartId = await ensureCart(pool, customerId);
        if (!cartId) return res.status(404).json({ success: false, error: 'Customer not found' });

        res.json({ success: true, items: await readCart(pool, customerId) });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to load cart' });
    }
};

// POST /api/cart/items  — add an item (quantity is ADDED to what is already in the cart)
// Body: { customerId, variantId, quantity }
exports.addItem = async (req, res) => {
    try {
        const { customerId, variantId } = req.body;
        const quantity = Number(req.body.quantity ?? 1);

        if (!customerId || !variantId || !validQty(quantity)) {
            return res.status(400).json({ success: false, error: `customerId, variantId and a quantity between 1 and ${MAX_QTY} are required` });
        }

        const cartId = await ensureCart(pool, customerId);
        if (!cartId) return res.status(404).json({ success: false, error: 'Customer not found' });

        await pool.query(
            `INSERT INTO cart_item (cart_item_id, cart_id, variant_id, quantity)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ${MAX_QTY})`,
            [newItemId(), cartId, variantId, quantity]
        );

        res.status(201).json({ success: true, items: await readCart(pool, customerId) });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ success: false, error: 'That product variant does not exist' });
        }
        console.error('Add cart item error:', error);
        res.status(500).json({ success: false, error: 'Failed to add item to cart' });
    }
};

// PUT /api/cart/items  — set an exact quantity (0 removes the item)
// Body: { customerId, variantId, quantity }
exports.setItemQuantity = async (req, res) => {
    try {
        const { customerId, variantId } = req.body;
        const quantity = Number(req.body.quantity);

        if (!customerId || !variantId || !Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QTY) {
            return res.status(400).json({ success: false, error: `customerId, variantId and a quantity between 0 and ${MAX_QTY} are required` });
        }

        const cartId = await ensureCart(pool, customerId);
        if (!cartId) return res.status(404).json({ success: false, error: 'Customer not found' });

        if (quantity === 0) {
            await pool.query('DELETE FROM cart_item WHERE cart_id = ? AND variant_id = ?', [cartId, variantId]);
        } else {
            await pool.query('UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND variant_id = ?', [quantity, cartId, variantId]);
        }

        res.json({ success: true, items: await readCart(pool, customerId) });
    } catch (error) {
        console.error('Set cart quantity error:', error);
        res.status(500).json({ success: false, error: 'Failed to update cart' });
    }
};

// DELETE /api/cart/:customerId/items/:variantId  — remove one item
exports.removeItem = async (req, res) => {
    try {
        const { customerId, variantId } = req.params;
        await pool.query(
            'DELETE ci FROM cart_item ci JOIN cart c ON c.cart_id = ci.cart_id WHERE c.customer_id = ? AND ci.variant_id = ?',
            [customerId, variantId]
        );
        res.json({ success: true, items: await readCart(pool, customerId) });
    } catch (error) {
        console.error('Remove cart item error:', error);
        res.status(500).json({ success: false, error: 'Failed to remove item' });
    }
};

// DELETE /api/cart/:customerId  — empty the whole cart (used after a successful order)
exports.clearCart = async (req, res) => {
    try {
        const { customerId } = req.params;
        await pool.query(
            'DELETE ci FROM cart_item ci JOIN cart c ON c.cart_id = ci.cart_id WHERE c.customer_id = ?',
            [customerId]
        );
        res.json({ success: true, items: [] });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to clear cart' });
    }
};

// POST /api/cart/sync  — merge a guest's cart into the customer's saved cart right after login
// Body: { customerId, items: [{ variantId, quantity }] }
// All-or-nothing: runs in one transaction.
exports.syncCart = async (req, res) => {
    const { customerId, items } = req.body;
    if (!customerId || !Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'customerId and an items array are required' });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const cartId = await ensureCart(connection, customerId);
        if (!cartId) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        for (const item of items) {
            const quantity = Number(item.quantity);
            if (!item.variantId || !validQty(quantity)) continue; // skip junk rows

            await connection.query(
                `INSERT INTO cart_item (cart_item_id, cart_id, variant_id, quantity)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE quantity = LEAST(quantity + VALUES(quantity), ${MAX_QTY})`,
                [newItemId(), cartId, item.variantId, quantity]
            );
        }

        await connection.commit();
        res.json({ success: true, items: await readCart(pool, customerId) });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(404).json({ success: false, error: 'One of the products no longer exists' });
        }
        console.error('Sync cart error:', error);
        res.status(500).json({ success: false, error: 'Failed to sync cart' });
    } finally {
        connection.release();
    }
};
