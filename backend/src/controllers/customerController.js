const pool = require('../config/db');
const { CUSTOMER_QUERY, toClientUser } = require('./authController');

// GET /api/customers/:id
exports.getCustomer = async (req, res) => {
    try {
        const [rows] = await pool.query(`${CUSTOMER_QUERY} WHERE c.customer_id = ?`, [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }
        res.json({ success: true, user: toClientUser(rows[0]) });
    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ success: false, error: 'Failed to load profile' });
    }
};

// PUT /api/customers/:id  — update phone and/or default address
// Body (all optional): { phone, city_id, address_line, postal_code }
exports.updateCustomer = async (req, res) => {
    const { phone, city_id, address_line, postal_code } = req.body;
    const customerId = req.params.id;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction(); // phone lives in `user`, address in `customer_address`: change both or neither

        const [existing] = await connection.query(
            'SELECT user_id FROM customer WHERE customer_id = ?',
            [customerId]
        );
        if (existing.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        if (phone !== undefined) {
            if (!String(phone).trim()) {
                await connection.rollback();
                return res.status(400).json({ success: false, error: 'Phone number cannot be empty' });
            }
            await connection.query('UPDATE `user` SET phone = ? WHERE user_id = ?', [String(phone).trim(), existing[0].user_id]);
        }

        if (city_id !== undefined || address_line !== undefined || postal_code !== undefined) {
            const [addr] = await connection.query(
                'SELECT address_id FROM customer_address WHERE customer_id = ? AND is_default = TRUE LIMIT 1',
                [customerId]
            );

            if (addr.length === 0) {
                // No default address yet: all three fields are needed to create one
                if (!city_id || !address_line?.trim() || !postal_code?.trim()) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, error: 'City, address and postal code are all required' });
                }
                await connection.query(
                    'INSERT INTO customer_address (address_id, customer_id, city_id, address_line, postal_code, is_default) VALUES (?, ?, ?, ?, ?, TRUE)',
                    [`ADDR-${Date.now().toString(36)}`, customerId, city_id, address_line.trim(), postal_code.trim()]
                );
            } else {
                // COALESCE(?, column) = keep the old value when the new one is not sent
                await connection.query(
                    `UPDATE customer_address
                     SET city_id = COALESCE(?, city_id),
                         address_line = COALESCE(?, address_line),
                         postal_code = COALESCE(?, postal_code)
                     WHERE address_id = ?`,
                    [city_id ?? null, address_line?.trim() ?? null, postal_code?.trim() ?? null, addr[0].address_id]
                );
            }
        }

        await connection.commit();

        const [rows] = await pool.query(`${CUSTOMER_QUERY} WHERE c.customer_id = ?`, [customerId]);
        res.json({ success: true, user: toClientUser(rows[0]) });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ success: false, error: 'Please choose a valid Texas city' });
        }
        console.error('Update customer error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    } finally {
        connection.release(); // always give the connection back to the pool
    }
};
