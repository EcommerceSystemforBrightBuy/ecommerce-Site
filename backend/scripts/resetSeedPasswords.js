// One-time helper: the seed users (USR001..USR005) have placeholder password
// hashes ("temp_hash_1"...), so nobody can log in as them. This script gives
// them a real bcrypt hash of a demo password so you can test login.
//
// Run from the backend folder:   node scripts/resetSeedPasswords.js
// Demo password afterwards:      Password123

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

(async () => {
    try {
        const hash = await bcrypt.hash('Password123', 10);
        const [result] = await pool.query(
            "UPDATE `user` SET password_hash = ? WHERE password_hash LIKE 'temp\\_hash\\_%'",
            [hash]
        );
        console.log(`Updated ${result.affectedRows} seed user(s). Log in with their email + Password123`);
    } catch (error) {
        console.error('Failed:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
