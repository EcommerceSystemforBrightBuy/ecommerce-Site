-- ============================================================
-- Member 3: Customer Auth, Profile & Cart
-- Run this file ONCE against the `brightbuy` database (after schema.sql).
-- It is safe to re-run: cities use INSERT IGNORE, the procedure is dropped first.
-- (Later you can paste the procedure into procedures.sql if the team wants
--  everything in one place.)
-- ============================================================

USE brightbuy;

-- ------------------------------------------------------------
-- 1. Texas cities
--    customer_address.city_id is a foreign key to city, so these rows must
--    exist before anyone can register. Same list as the frontend
--    (TEXAS_CITIES in mockData.js): first 5 are "main cities" (5-day
--    delivery), the rest are regional (7-day delivery).
-- ------------------------------------------------------------
INSERT IGNORE INTO city (city_id, city_name, is_main_city) VALUES
('CITY-AUSTIN',        'Austin',         TRUE),
('CITY-DALLAS',        'Dallas',         TRUE),
('CITY-HOUSTON',       'Houston',        TRUE),
('CITY-SANANTONIO',    'San Antonio',    TRUE),
('CITY-FORTWORTH',     'Fort Worth',     TRUE),
('CITY-ELPASO',        'El Paso',        FALSE),
('CITY-ARLINGTON',     'Arlington',      FALSE),
('CITY-CORPUSCHRISTI', 'Corpus Christi', FALSE),
('CITY-PLANO',         'Plano',          FALSE),
('CITY-LUBBOCK',       'Lubbock',        FALSE),
('CITY-LAREDO',        'Laredo',         FALSE),
('CITY-IRVING',        'Irving',         FALSE),
('CITY-AMARILLO',      'Amarillo',       FALSE);

-- ------------------------------------------------------------
-- 2. sp_register_customer
--    ONE atomic transaction that creates:
--        user  ->  customer  ->  customer_address
--    If any step fails (duplicate email, bad city, ...) everything is rolled
--    back, so we never end up with a user that has no customer record.
--
--    Errors it raises on purpose (SIGNAL):
--        EMAIL_EXISTS   - this email is already registered
--        INVALID_CITY   - city_id is not in the city table
--
--    It returns one row: user_id, customer_id, address_id.
--    Ids are UUID based (full length, dashes removed), so two people
--    registering at the same moment can never collide on an id.
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_register_customer;

DELIMITER $$

CREATE PROCEDURE sp_register_customer(
    IN p_email         VARCHAR(150),
    IN p_password_hash VARCHAR(255),
    IN p_first_name    VARCHAR(100),
    IN p_last_name     VARCHAR(100),
    IN p_phone         VARCHAR(20),
    IN p_city_id       VARCHAR(50),
    IN p_address_line  VARCHAR(255),
    IN p_postal_code   VARCHAR(20)
)
BEGIN
    DECLARE v_user_id     VARCHAR(50);
    DECLARE v_customer_id VARCHAR(50);
    DECLARE v_address_id  VARCHAR(50);

    -- Any SQL error: undo everything, then pass the error up to Node.js
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SET v_user_id     = CONCAT('USR-',  REPLACE(UUID(), '-', ''));
    SET v_customer_id = CONCAT('CUST-', REPLACE(UUID(), '-', ''));
    SET v_address_id  = CONCAT('ADDR-', REPLACE(UUID(), '-', ''));

    START TRANSACTION;

    IF EXISTS (SELECT 1 FROM `user` WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'EMAIL_EXISTS';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM city WHERE city_id = p_city_id) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'INVALID_CITY';
    END IF;

    -- Step 1: login account
    INSERT INTO `user` (user_id, email, password_hash, first_name, last_name, phone, role)
    VALUES (v_user_id, p_email, p_password_hash, p_first_name, p_last_name, p_phone, 'customer');

    -- Step 2: customer profile linked to the account
    INSERT INTO customer (customer_id, user_id)
    VALUES (v_customer_id, v_user_id);

    -- Step 3: default delivery address
    INSERT INTO customer_address (address_id, customer_id, city_id, address_line, postal_code, is_default)
    VALUES (v_address_id, v_customer_id, p_city_id, p_address_line, p_postal_code, TRUE);

    COMMIT;

    SELECT v_user_id AS user_id, v_customer_id AS customer_id, v_address_id AS address_id;
END$$

DELIMITER ;

-- ------------------------------------------------------------
-- 3. Cart queries (reference copy)
--    These exact statements are used in backend/src/controllers/cartController.js.
--    One cart per customer (cart.customer_id is UNIQUE) and one row per
--    variant in a cart (cart_item has UNIQUE (cart_id, variant_id)).
--    "?" are placeholders filled in by Node.js (prevents SQL injection).
-- ------------------------------------------------------------

-- 3.1 Create the customer's cart if it doesn't exist yet
--     INSERT IGNORE INTO cart (cart_id, customer_id) VALUES (?, ?);

-- 3.2 Add an item (adds to the quantity if the variant is already in the cart)
--     INSERT INTO cart_item (cart_item_id, cart_id, variant_id, quantity)
--     VALUES (?, ?, ?, ?)
--     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity);

-- 3.3 Set an exact quantity
--     UPDATE cart_item SET quantity = ? WHERE cart_id = ? AND variant_id = ?;

-- 3.4 Remove one item / empty the cart
--     DELETE FROM cart_item WHERE cart_id = ? AND variant_id = ?;
--     DELETE FROM cart_item WHERE cart_id = ?;

-- 3.5 Read the cart with product details and live stock
--     SELECT ci.variant_id, ci.quantity,
--            pv.sku, pv.variant_name, pv.price,
--            p.product_id, p.product_name, p.image_url,
--            COALESCE(i.quantity_on_hand, 0) AS stock
--     FROM cart c
--     JOIN cart_item ci      ON ci.cart_id = c.cart_id
--     JOIN product_variant pv ON pv.variant_id = ci.variant_id
--     JOIN product p          ON p.product_id = pv.product_id
--     LEFT JOIN inventory i   ON i.variant_id = pv.variant_id
--     WHERE c.customer_id = ?
--     ORDER BY ci.added_at;
