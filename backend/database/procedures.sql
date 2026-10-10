DELIMITER //
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
        user_id,
        order_id,
        transaction_type,
        quantity_change,
        transaction_date
    )
    VALUES (
        UUID(),
        v_inventory_id,
        p_user_id,
        NULL,
        p_transaction_type,
        p_quantity_change,
        NOW()
    );

    COMMIT;
END //
DELIMITER ;
