USE brightbuy;

-- Report 1: quarterly sales
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

-- Report 2: top selling products
CREATE OR REPLACE VIEW v_top_selling_products AS
SELECT p.product_id,
       p.product_name,
       p.brand,
       DATE_FORMAT(o.order_date, '%Y-%m-%d') AS sales_date,
       SUM(oi.quantity) AS units_sold,
       SUM(oi.subtotal) AS gross_revenue
FROM order_item oi
JOIN `order` o         ON o.order_id = oi.order_id
JOIN product_variant v ON v.variant_id = oi.variant_id
JOIN product p         ON p.product_id = v.product_id
WHERE o.order_status <> 'cancelled'
GROUP BY p.product_id, p.product_name, p.brand, DATE_FORMAT(o.order_date, '%Y-%m-%d');

-- Report 3: number of orders per category
CREATE OR REPLACE VIEW v_category_order_totals AS
SELECT c.category_id,
       c.category_name,
       COUNT(DISTINCT o.order_id) AS total_orders
FROM category c
LEFT JOIN product_category pc ON pc.category_id = c.category_id
LEFT JOIN product_variant v   ON v.product_id = pc.product_id
LEFT JOIN order_item oi       ON oi.variant_id = v.variant_id
LEFT JOIN `order` o           ON o.order_id = oi.order_id
                             AND o.order_status <> 'cancelled'
GROUP BY c.category_id, c.category_name;

-- Report 4: delivery estimates for orders not yet delivered
CREATE OR REPLACE VIEW v_delivery_time_estimates AS
SELECT o.order_id,
       DATE_FORMAT(o.order_date, '%Y-%m-%d') AS order_date,
       o.order_status,
       CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
       d.delivery_mode,
       ci.city_name,
       ci.is_main_city,
       DATE_FORMAT(d.estimated_delivery_date, '%Y-%m-%d') AS estimated_delivery_date,
       d.delivery_status,
       DATEDIFF(d.estimated_delivery_date, CURDATE()) AS days_remaining
FROM `order` o
JOIN delivery d  ON d.order_id = o.order_id
JOIN customer cu ON cu.customer_id = o.customer_id
JOIN `user` u    ON u.user_id = cu.user_id
LEFT JOIN customer_address a ON a.address_id = d.delivery_address_id
LEFT JOIN city ci            ON ci.city_id = a.city_id
WHERE o.order_status NOT IN ('delivered', 'cancelled');

-- Report 5: customer-wise order summary and payment status
CREATE OR REPLACE VIEW v_customer_order_summary AS
SELECT cu.customer_id,
       CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
       u.email,
       COUNT(o.order_id)                         AS total_orders,
       COALESCE(SUM(o.total_amount), 0)          AS lifetime_spend,
       COALESCE(SUM(p.payment_method = 'Card Payment'), 0)     AS card_orders,
       COALESCE(SUM(p.payment_method = 'Cash on Delivery'), 0) AS cod_orders,
       COALESCE(SUM(p.payment_status = 'completed'), 0)        AS paid_orders,
       COALESCE(SUM(p.payment_status = 'pending'), 0)          AS pending_payments
FROM customer cu
JOIN `user` u ON u.user_id = cu.user_id
LEFT JOIN `order` o ON o.customer_id = cu.customer_id
                   AND o.order_status <> 'cancelled'
LEFT JOIN payment p ON p.order_id = o.order_id
GROUP BY cu.customer_id, u.first_name, u.last_name, u.email;
