DELIMITER //
CREATE FUNCTION fn_calculate_delivery_days(city_id VARCHAR(50), in_stock BOOLEAN)
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE base_days INT DEFAULT 0;
    DECLARE city_tier VARCHAR(20);

    SELECT CASE
        WHEN city.is_main_city = TRUE THEN 'main'
        ELSE 'regional'
    END INTO city_tier
    FROM city
    WHERE city.city_id = city_id;

    IF city_tier IS NULL THEN
        SET city_tier = 'regional';
    END IF;

    IF city_tier = 'main' THEN
        SET base_days = 5;
    ELSE
        SET base_days = 7;
    END IF;

    IF in_stock = FALSE THEN
        SET base_days = base_days + 3;
    END IF;

    RETURN base_days;
END //
DELIMITER ;
