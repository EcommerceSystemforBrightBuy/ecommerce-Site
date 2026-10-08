USE brightbuy;

DELIMITER //

DROP TRIGGER IF EXISTS trg_after_inventory_update //

CREATE TRIGGER trg_after_inventory_update
AFTER UPDATE ON inventory
FOR EACH ROW
BEGIN
    DECLARE v_change INT;
    SET v_change = NEW.quantity_on_hand - OLD.quantity_on_hand;

    -- Log transaction when stock quantity changes
    IF v_change != 0 THEN
        INSERT INTO inventory_transaction (
            transaction_id, 
            inventory_id, 
            transaction_type, 
            quantity_change, 
            transaction_date
        )
        VALUES (
            CONCAT('TXN-', UUID()), 
            NEW.inventory_id, 
            IF(v_change < 0, 'order_deduction', 'restock'), 
            v_change, 
            NOW()
        );
    END IF;
END //

DELIMITER ;
