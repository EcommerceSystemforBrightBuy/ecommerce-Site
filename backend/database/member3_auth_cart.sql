USE brightbuy;


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

    
    INSERT INTO `user` (user_id, email, password_hash, first_name, last_name, phone, role)
    VALUES (v_user_id, p_email, p_password_hash, p_first_name, p_last_name, p_phone, 'customer');

    
    INSERT INTO customer (customer_id, user_id)
    VALUES (v_customer_id, v_user_id);

    
    INSERT INTO customer_address (address_id, customer_id, city_id, address_line, postal_code, is_default)
    VALUES (v_address_id, v_customer_id, p_city_id, p_address_line, p_postal_code, TRUE);

    COMMIT;

    SELECT v_user_id AS user_id, v_customer_id AS customer_id, v_address_id AS address_id;
END$$

DELIMITER ;