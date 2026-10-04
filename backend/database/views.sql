-- Views: The 5 management reports (Placeholder)

USE brightbuy;

CREATE OR REPLACE VIEW v_quarterly_sales AS
SELECT YEAR(o.order_date) AS sales_year,
       QUARTER(o.order_date) AS sales_quarter,
       COUNT(DISTINCT o.order_id) AS total_orders,
       SUM(oi.quantity) AS units_sold,
       SUM(oi.subtotal) AS total_revenue
FROM `order` o
JOIN order_item oi ON oi.order_id = o.order_id
WHERE o.order_status <> 'cancelled'
GROUP BY YEAR(o.order_date), QUARTER(o.order_date);
