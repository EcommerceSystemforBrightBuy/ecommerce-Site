USE brightbuy;

DROP FUNCTION IF EXISTS fn_calculate_delivery_days;

DELIMITER //

CREATE FUNCTION fn_calculate_delivery_days(p_city_id VARCHAR(50), p_in_stock BOOLEAN)
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE base_days INT DEFAULT 7;
    DECLARE city_tier VARCHAR(20);

    -- Fixed shadowing bug: explicitly use parameter p_city_id instead of shadowed column name
    SELECT CASE
        WHEN city.is_main_city = TRUE THEN 'main'
        ELSE 'regional'
    END INTO city_tier
    FROM city
    WHERE city.city_id = p_city_id
    LIMIT 1;

    IF city_tier IS NULL THEN
        SET city_tier = 'regional';
    END IF;

    IF city_tier = 'main' THEN
        SET base_days = 5;
    ELSE
        SET base_days = 7;
    END IF;

    -- Out of stock penalty (+3 days buffer for Central Texas warehouse replenishment)
    IF p_in_stock = FALSE THEN
        SET base_days = base_days + 3;
    END IF;

    RETURN base_days;
END //

DELIMITER ;
