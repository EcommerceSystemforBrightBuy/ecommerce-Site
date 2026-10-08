USE brightbuy;

DELIMITER /
/

DROP PROCEDURE IF EXISTS sp_checkout_order /
/

CREATE PROCEDURE sp_checkout_order(
    IN p_order_id VARCHAR(50),
    IN p_customer_id VARCHAR(50),
    IN p_total_amount DECIMAL(10,2),
    IN p_delivery_mode VARCHAR(50),
    IN p_address_id VARCHAR(50),
    IN p_city_id VARCHAR(50),
    IN p_payment_method VARCHAR(50),
    IN p_variant_id VARCHAR(50),
    IN p_quantity INT,
    IN p_unit_price DECIMAL(10,2) 
)
BEGIN
    DECLARE v_delivery_days INT DEFAULT 5;

    -- Rollback automatically if any SQL error occurs
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Calculate estimated delivery days dynamically (5, 7, 8, or 10 days)
    SET v_delivery_days = fn_calculate_delivery_days(p_city_id, p_variant_id, p_quantity);

    START TRANSACTION;

    -- Create `order` record
    INSERT INTO `order` (order_id, customer_id, total_amount, order_status)
    VALUES (p_order_id, p_customer_id, p_total_amount, 'confirmed');

    -- Create `order_item` record
    INSERT INTO order_item (order_item_id, order_id, variant_id, quantity, unit_price, subtotal)
    VALUES (CONCAT('ITEM-', UUID()), p_order_id, p_variant_id, p_quantity, p_unit_price, (p_quantity * p_unit_price));


    --  Create `delivery` record
    INSERT INTO delivery (delivery_id, order_id, delivery_mode, delivery_address_id, estimated_delivery_date, delivery_status)
    VALUES (
        CONCAT('DEL-', UUID()), 
        p_order_id, 
        IF(p_delivery_mode='pickup', 'Store Pickup', 'Standard Delivery'), 
        p_address_id, 
        DATE_ADD(NOW(), INTERVAL v_delivery_days DAY), 
        'pending'
    );

    -- Create `payment` record
    INSERT INTO payment (payment_id, order_id, payment_method, payment_status, amount)
    VALUES (
        CONCAT('PAY-', UUID()), 
        p_order_id, 
        IF(p_payment_method='cod', 'Cash on Delivery', 'Card Payment'), 
        IF(p_payment_method='cod', 'pending', 'completed'), 
        p_total_amount
    );

    COMMIT;
END
/
/

DELIMITER;