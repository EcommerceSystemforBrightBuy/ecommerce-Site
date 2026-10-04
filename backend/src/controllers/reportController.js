const pool = require('./../config/db');

const getQuarterlySales = async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10) || new Date().getFullYear();

        const [rows] = await pool.execute(
            'Select sales_year, sales_quarter, total_orders, units_sold, total_revenue from v_quarterly_sales where sales_year = ? order by sales_quarter',
            [year]
        );

        const formatted = rows.map(r => ({
            ...r,
            units_sold: Number(r.units_sold),
            total_revenue: parseFloat(r.total_revenue)
        }));

        res.status(200).json(formatted);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch quarterly sales' });
    }
};

module.exports = { getQuarterlySales };