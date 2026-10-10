const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Turns a database row (user + customer + default address + city) into the
// object the frontend keeps in memory. The password hash is NEVER included.
const toClientUser = (row) => ({
    id: row.customer_id,            // the frontend checkout pages read currentUser.id
    customerId: row.customer_id,
    userId: row.user_id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    name: `${row.first_name} ${row.last_name}`.trim(),
    phone: row.phone,
    addressId: row.address_id,
    addressLine: row.address_line,
    postalCode: row.postal_code,
    cityId: row.city_id,
    city: row.city_name,
    isRegistered: true,
});

// One query that gathers everything about a customer (used by login and by the customer routes)
const CUSTOMER_QUERY = `
    SELECT u.user_id, u.email, u.first_name, u.last_name, u.phone,
           c.customer_id,
           a.address_id, a.address_line, a.postal_code,
           ci.city_id, ci.city_name
    FROM \`user\` u
    JOIN customer c            ON c.user_id = u.user_id
    LEFT JOIN customer_address a ON a.customer_id = c.customer_id AND a.is_default = TRUE
    LEFT JOIN city ci          ON ci.city_id = a.city_id
`;

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone, city_id, address_line, postal_code } = req.body;

        // 1. Validate input (never trust what the browser sends)
        if (!first_name?.trim() || !email?.trim() || !password || !phone?.trim() || !city_id || !address_line?.trim() || !postal_code?.trim()) {
            return res.status(400).json({ success: false, error: 'Please fill in all required fields' });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        // 2. Hash the password (bcrypt adds a random salt; 10 = work factor)
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Call the stored procedure (one atomic transaction in MySQL)
        const [results] = await pool.query(
            'CALL sp_register_customer(?, ?, ?, ?, ?, ?, ?, ?)',
            [
                email.trim().toLowerCase(),
                passwordHash,
                first_name.trim(),
                (last_name || '').trim(),
                phone.trim(),
                city_id,
                address_line.trim(),
                postal_code.trim(),
            ]
        );
        const ids = results[0][0]; // first result set, first row: { user_id, customer_id, address_id }

        // 4. Return the new profile so the frontend can log the user straight in
        const [rows] = await pool.query(`${CUSTOMER_QUERY} WHERE c.customer_id = ?`, [ids.customer_id]);

        res.status(201).json({ success: true, user: toClientUser(rows[0]) });
    } catch (error) {
        if (error.sqlMessage === 'EMAIL_EXISTS' || error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ success: false, error: 'An account with this email already exists' });
        }
        if (error.sqlMessage === 'INVALID_CITY') {
            return res.status(400).json({ success: false, error: 'Please choose a valid Texas city' });
        }
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        const [rows] = await pool.query(
            `${CUSTOMER_QUERY} WHERE u.email = ? AND u.role = 'customer'`,
            [email.trim().toLowerCase()]
        );

        // Fetch the stored hash separately so it can never leak into the response object
        let passwordOk = false;
        if (rows.length > 0) {
            const [hashRows] = await pool.query('SELECT password_hash FROM `user` WHERE user_id = ?', [rows[0].user_id]);
            passwordOk = await bcrypt.compare(password, hashRows[0].password_hash);
        }

        // Same message for "no such email" and "wrong password" so attackers can't find out which emails exist
        if (!passwordOk) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }

        res.json({ success: true, user: toClientUser(rows[0]) });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
    }
};

exports.CUSTOMER_QUERY = CUSTOMER_QUERY;
exports.toClientUser = toClientUser;
