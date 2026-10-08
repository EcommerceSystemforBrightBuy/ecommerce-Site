USE brightbuy;

DELIMITER /
/

DROP FUNCTION IF EXISTS fn_calculate_delivery_days /
/

CREATE FUNCTION fn_calculate_delivery_days(
    p_city_id VARCHAR(50),
    p_variant_id VARCHAR(50),
    p_quantity INT
) RETURNS INT
DETERMINISTIC
READS SQL DATA 
BEGIN
    DECLARE v_is_main_city BOOLEAN DEFAULT FALSE;
    DECLARE v_stock INT DEFAULT 0;
    DECLARE v_base_days INT DEFAULT 7;  
    DECLARE v_extra_days INT DEFAULT 0; 

    -- Check if destination city is a Main City
    SELECT is_main_city INTO v_is_main_city
    FROM city
    WHERE city_id = p_city_id
    LIMIT 1;

    IF v_is_main_city THEN
        SET v_base_days = 5;
    ELSE 
        SET v_base_days = 7;
    END IF;

    -- Check current inventory
    SELECT quantity_on_hand INTO v_stock
    FROM inventory
    WHERE variant_id = p_variant_id
    LIMIT 1;

    -- Add 3 extra days penalty if item is out of stock at time of order
    IF v_stock < p_quantity THEN
        SET v_extra_days = 3;
    END IF; 

    RETURN v_base_days + v_extra_days;
END
/
/

DELIMITER;