USE brightbuy;

DROP PROCEDURE IF EXISTS sp_adjust_warehouse_stock;
DROP PROCEDURE IF EXISTS sp_checkout_order;

DELIMITER //

-- 1. Procedure: Adjust Warehouse Stock
CREATE PROCEDURE sp_adjust_warehouse_stock(
    IN p_variant_id VARCHAR(50),
    IN p_quantity_change INT,
    IN p_transaction_type VARCHAR(20),
    IN p_user_id VARCHAR(50)
)
BEGIN
    DECLARE v_inventory_id VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT inventory_id INTO v_inventory_id
    FROM inventory
    WHERE variant_id = p_variant_id
    FOR UPDATE;

    IF v_inventory_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Inventory row not found for variant';
    END IF;

    UPDATE inventory
    SET quantity_on_hand = quantity_on_hand + p_quantity_change,
        last_restocked_at = NOW()
    WHERE variant_id = p_variant_id;

    INSERT INTO inventory_transaction (
        transaction_id,
        inventory_id,
        order_id,
        transaction_type,
        quantity_change,
        transaction_date
    )
    VALUES (
        UUID(),
        v_inventory_id,
        NULL,
        p_transaction_type,
        p_quantity_change,
        NOW()
    );

    COMMIT;
END //

-- 2. Procedure: Checkout Order (Atomic creation of Order, Item, Delivery, Payment, and Stock Deduction)
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
    DECLARE v_stock INT DEFAULT 0;
    DECLARE v_inventory_id VARCHAR(50);
    DECLARE v_formatted_delivery_mode VARCHAR(50);
    DECLARE v_formatted_payment_method VARCHAR(50);
    DECLARE v_payment_status VARCHAR(20);

    -- Automatic rollback on any SQL exception
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Format delivery mode
    IF p_delivery_mode = 'pickup' OR p_delivery_mode = 'Store Pickup' OR p_delivery_mode = 'Central Store Pickup' THEN
        SET v_formatted_delivery_mode = 'Store Pickup';
        SET v_delivery_days = 1;
    ELSE
        SET v_formatted_delivery_mode = 'Standard Delivery';
    END IF;

    -- Format payment method and default status
    IF p_payment_method = 'cod' OR p_payment_method = 'Cash on Delivery' THEN
        SET v_formatted_payment_method = 'Cash on Delivery';
        SET v_payment_status = 'pending';
    ELSE
        SET v_formatted_payment_method = 'Card Payment';
        SET v_payment_status = 'completed';
    END IF;

    -- Check current inventory for variant
    SELECT inventory_id, quantity_on_hand
    INTO v_inventory_id, v_stock
    FROM inventory
    WHERE variant_id = p_variant_id
    LIMIT 1;

    -- If Standard Delivery, compute dynamic delivery estimate using function
    IF v_formatted_delivery_mode = 'Standard Delivery' THEN
        SET v_delivery_days = fn_calculate_delivery_days(p_city_id, (v_stock >= p_quantity));
    END IF;

    START TRANSACTION;

    -- 1. Create order record
    INSERT INTO `order` (order_id, customer_id, total_amount, order_status, order_date)
    VALUES (p_order_id, p_customer_id, p_total_amount, 'confirmed', NOW());

    -- 2. Create primary order_item record
    INSERT INTO order_item (order_item_id, order_id, variant_id, quantity, unit_price, subtotal)
    VALUES (
        CONCAT('ITEM-', REPLACE(UUID(), '-', '')),
        p_order_id,
        p_variant_id,
        p_quantity,
        p_unit_price,
        (p_quantity * p_unit_price)
    );

    -- 3. Atomic inventory stock decrement and transaction audit logging
    IF v_inventory_id IS NOT NULL THEN
        UPDATE inventory
        SET quantity_on_hand = GREATEST(0, quantity_on_hand - p_quantity)
        WHERE inventory_id = v_inventory_id;

        INSERT INTO inventory_transaction (
            transaction_id,
            inventory_id,
            order_id,
            transaction_type,
            quantity_change,
            transaction_date
        ) VALUES (
            CONCAT('TXN-', REPLACE(UUID(), '-', '')),
            v_inventory_id,
            p_order_id,
            'order_deduction',
            -p_quantity,
            NOW()
        );
    END IF;

    -- 4. Create delivery record
    INSERT INTO delivery (
        delivery_id,
        order_id,
        delivery_mode,
        delivery_address_id,
        estimated_delivery_date,
        delivery_status
    ) VALUES (
        CONCAT('DEL-', REPLACE(UUID(), '-', '')),
        p_order_id,
        v_formatted_delivery_mode,
        p_address_id,
        DATE_ADD(CURDATE(), INTERVAL v_delivery_days DAY),
        'pending'
    );

    -- 5. Create payment record
    INSERT INTO payment (
        payment_id,
        order_id,
        payment_method,
        payment_status,
        amount,
        payment_date
    ) VALUES (
        CONCAT('PAY-', REPLACE(UUID(), '-', '')),
        p_order_id,
        v_formatted_payment_method,
        v_payment_status,
        p_total_amount,
        NOW()
    );

    COMMIT;
END //

DELIMITER ;
