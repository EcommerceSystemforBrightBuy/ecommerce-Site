const express = require('express');
const pool = require('../config/db');

const cityRouter = express.Router();

cityRouter.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT city_id, city_name, is_main_city FROM city ORDER BY is_main_city DESC, city_name'
        );
        res.json(rows.map((r) => ({ ...r, is_main_city: !!r.is_main_city })));
    } catch (error) {
        console.error('Get cities error:', error);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

module.exports = cityRouter;
