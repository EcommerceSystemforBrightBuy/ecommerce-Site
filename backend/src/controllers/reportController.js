const pool = require('./../config/db');

// helper: build a YYYY-MM-DD string without time zone problems
const fmt = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const getQuarterlySales = async (req, res) => {
    try {
        const year = parseInt(req.query.year, 10) || new Date().getFullYear();

        const [rows] = await pool.execute(
            'Select sales_year, sales_quarter, total_orders, units_sold, total_revenue from v_quarterly_sales where sales_year = ? order by sales_quarter',
            [year]
        );

        res.status(200).json(rows.map(r => ({
            ...r,
            units_sold: Number(r.units_sold),
            total_revenue: parseFloat(r.total_revenue)
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch quarterly sales' });
    }
};

const getTopSelling = async (req, res) => {
    try {
        const period = req.query.period || 'ytd'; // ytd | month | quarter | all
        const now = new Date();
        const y = now.getFullYear();
        const m = now.getMonth();

        let start = null;
        if (period === 'ytd') start = fmt(y, 0, 1);
        else if (period === 'month') start = fmt(y, m, 1);
        else if (period === 'quarter') start = fmt(y, Math.floor(m / 3) * 3, 1);

        let sql = 'Select product_id, product_name, brand, sum(units_sold) as units_sold, sum(gross_revenue) as gross_revenue from v_top_selling_products';
        const params = [];

        if (start) {
            sql += ' where sales_date >= ?';
            params.push(start);
        }

        sql += ' group by product_id, product_name, brand order by units_sold desc, gross_revenue desc limit 10';

        const [rows] = await pool.execute(sql, params);

        res.status(200).json(rows.map((r, i) => ({
            rank: i + 1,
            ...r,
            units_sold: Number(r.units_sold),
            gross_revenue: parseFloat(r.gross_revenue)
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch top selling products' });
    }
};

const getCategoryOrders = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'Select category_id, category_name, total_orders from v_category_order_totals order by total_orders desc, category_name'
        );
        res.status(200).json(rows.map(r => ({ ...r, total_orders: Number(r.total_orders) })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch category orders' });
    }
};

const getDeliveryEstimates = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'Select * from v_delivery_time_estimates order by estimated_delivery_date'
        );
        res.status(200).json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch delivery estimates' });
    }
};

const getCustomerSummary = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'Select * from v_customer_order_summary order by lifetime_spend desc'
        );
        res.status(200).json(rows.map(r => ({
            ...r,
            total_orders: Number(r.total_orders),
            lifetime_spend: parseFloat(r.lifetime_spend),
            card_orders: Number(r.card_orders),
            cod_orders: Number(r.cod_orders),
            paid_orders: Number(r.paid_orders),
            pending_payments: Number(r.pending_payments)
        })));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch customer summary' });
    }
};

module.exports = {
    getQuarterlySales,
    getTopSelling,
    getCategoryOrders,
    getDeliveryEstimates,
    getCustomerSummary
};