CREATE DATABASE IF NOT EXISTS brightbuy;

USE brightbuy;

-- Drop tables in reverse order of foreign key dependencies
DROP TABLE IF EXISTS cart_item;

DROP TABLE IF EXISTS cart;

DROP TABLE IF EXISTS order_item;

DROP TABLE IF EXISTS inventory_transaction;

DROP TABLE IF EXISTS inventory;

DROP TABLE IF EXISTS product_feedback;

DROP TABLE IF EXISTS product_attribute;

DROP TABLE IF EXISTS product_category;

DROP TABLE IF EXISTS product_variant;

DROP TABLE IF EXISTS product;

DROP TABLE IF EXISTS subcategory;

DROP TABLE IF EXISTS category;

DROP TABLE IF EXISTS payment;

DROP TABLE IF EXISTS delivery;

DROP TABLE IF EXISTS `order`;

DROP TABLE IF EXISTS customer_address;

DROP TABLE IF EXISTS customer;

DROP TABLE IF EXISTS city;

DROP TABLE IF EXISTS `user`;

-- 1. User & Authentication

CREATE TABLE `user` (
    user_id VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM(
        'customer',
        'admin',
        'warehouse_staff'
    ) NOT NULL DEFAULT 'customer',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_user PRIMARY KEY (user_id),
    CONSTRAINT uq_user_email UNIQUE (email)
) ENGINE = InnoDB;

-- 2. Customer

CREATE TABLE customer (
    customer_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_customer PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_user UNIQUE (user_id),
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES `user` (user_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- 3. Texas Cities (for estimated delivery rules)

CREATE TABLE city (
    city_id VARCHAR(50) NOT NULL,
    city_name VARCHAR(100) NOT NULL,
    is_main_city BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_city PRIMARY KEY (city_id),
    CONSTRAINT uq_city_name UNIQUE (city_name)
) ENGINE = InnoDB;

-- 4. Customer Addresses

CREATE TABLE customer_address (
    address_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    city_id VARCHAR(50) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_customer_address PRIMARY KEY (address_id),
    CONSTRAINT fk_custaddr_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_custaddr_city FOREIGN KEY (city_id) REFERENCES city (city_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_custaddr_customer ON customer_address (customer_id);

-- 5. Product Classification: Category & Subcategory

CREATE TABLE category (
    category_id VARCHAR(50) NOT NULL,
    category_name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    CONSTRAINT pk_category PRIMARY KEY (category_id),
    CONSTRAINT uq_category_name UNIQUE (category_name)
) ENGINE = InnoDB;

CREATE INDEX idx_category_name ON category (category_name);

CREATE TABLE subcategory (
    subcategory_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    subcategory_name VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,
    CONSTRAINT pk_subcategory PRIMARY KEY (subcategory_id),
    CONSTRAINT fk_subcategory_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_subcategory_cat ON subcategory (category_id);

-- 6. Product Master

CREATE TABLE product (
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    badge VARCHAR(50) DEFAULT NULL,
    image_url VARCHAR(500) DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_product PRIMARY KEY (product_id)
) ENGINE = InnoDB;

CREATE INDEX idx_product_brand ON product (brand);

-- 7. Product-Category Mapping (Many-to-Many)

CREATE TABLE product_category (
    product_id VARCHAR(50) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    CONSTRAINT pk_product_category PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_prodcat_product FOREIGN KEY (product_id) REFERENCES product (product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_prodcat_category FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- 8. Product Variants & SKU

CREATE TABLE product_variant (
    variant_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    variant_name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_product_variant PRIMARY KEY (variant_id),
    CONSTRAINT uq_variant_sku UNIQUE (sku),
    CONSTRAINT chk_variant_price CHECK (price >= 0),
    CONSTRAINT fk_variant_product FOREIGN KEY (product_id) REFERENCES product (product_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_variant_product_default ON product_variant (product_id, is_default);

-- 9. Product Variant Attributes (Color, Storage, Size, etc.)

CREATE TABLE product_attribute (
    attribute_id VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value VARCHAR(100) NOT NULL,
    CONSTRAINT pk_product_attribute PRIMARY KEY (attribute_id),
    CONSTRAINT fk_attribute_variant FOREIGN KEY (variant_id) REFERENCES product_variant (variant_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_attribute_variant ON product_attribute (variant_id);

 -- 10. Product Feedback & Ratings

CREATE TABLE product_feedback (
    feedback_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_feedback PRIMARY KEY (feedback_id),
    CONSTRAINT fk_feedback_product FOREIGN KEY (product_id) REFERENCES product (product_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_feedback UNIQUE (product_id, customer_id)  -- Ensure one feedback per product per customer
) ENGINE = InnoDB;

-- 11. Central Warehouse Inventory

CREATE TABLE inventory (
    inventory_id VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 5,
    last_restocked_at DATETIME DEFAULT NULL,
    CONSTRAINT pk_inventory PRIMARY KEY (inventory_id),
    CONSTRAINT uq_inventory_variant UNIQUE (variant_id),
    CONSTRAINT chk_inventory_qty CHECK (quantity_on_hand >= 0),
    CONSTRAINT fk_inventory_variant FOREIGN KEY (variant_id) REFERENCES product_variant (variant_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- 12. Orders

CREATE TABLE `order` (
    order_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    order_status ENUM(
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    CONSTRAINT pk_order PRIMARY KEY (order_id),
    CONSTRAINT chk_order_total CHECK (total_amount >= 0),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_order_customer ON `order` (customer_id);

CREATE INDEX idx_order_date ON `order` (order_date);

-- 13. Order Items

CREATE TABLE order_item (
    order_item_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT pk_order_item PRIMARY KEY (order_item_id),
    CONSTRAINT chk_order_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_order_item_subtotal CHECK (subtotal >= 0),
    CONSTRAINT fk_orderitem_order FOREIGN KEY (order_id) REFERENCES `order` (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_orderitem_variant FOREIGN KEY (variant_id) REFERENCES product_variant (variant_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_orderitem_order ON order_item (order_id);

CREATE INDEX idx_orderitem_variant ON order_item (variant_id);

-- 14. Inventory Audit / Transactions

CREATE TABLE inventory_transaction (
    transaction_id VARCHAR(50) NOT NULL,
    inventory_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) DEFAULT NULL,
    transaction_type ENUM(
        'restock',
        'order_deduction',
        'adjustment',
        'return'
    ) NOT NULL,
    quantity_change INT NOT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_inventory_transaction PRIMARY KEY (transaction_id),
    CONSTRAINT fk_invtrans_inventory FOREIGN KEY (inventory_id) REFERENCES inventory (inventory_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_invtrans_order FOREIGN KEY (order_id) REFERENCES `order` (order_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_invtrans_inventory ON inventory_transaction (inventory_id);

-- 15. Delivery Details

CREATE TABLE delivery (
    delivery_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    delivery_mode ENUM(
        'Store Pickup',
        'Standard Delivery'
    ) NOT NULL,
    delivery_address_id VARCHAR(50) DEFAULT NULL,
    estimated_delivery_date DATE NOT NULL,
    actual_delivery_date DATE DEFAULT NULL,
    delivery_status ENUM(
        'pending',
        'dispatched',
        'delivered',
        'failed'
    ) NOT NULL DEFAULT 'pending',
    CONSTRAINT pk_delivery PRIMARY KEY (delivery_id),
    CONSTRAINT uq_delivery_order UNIQUE (order_id),
    CONSTRAINT fk_delivery_order FOREIGN KEY (order_id) REFERENCES `order` (order_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_delivery_address FOREIGN KEY (delivery_address_id) REFERENCES customer_address (address_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_delivery_date ON delivery (estimated_delivery_date);

-- 16. Payment Details

CREATE TABLE payment (
    payment_id VARCHAR(50) NOT NULL,
    order_id VARCHAR(50) NOT NULL,
    payment_method ENUM(
        'Cash on Delivery',
        'Card Payment'
    ) NOT NULL,
    payment_status ENUM(
        'pending',
        'completed',
        'failed',
        'refunded'
    ) NOT NULL DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    payment_date DATETIME DEFAULT NULL,
    txn_reference VARCHAR(100) DEFAULT NULL,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id),
    CONSTRAINT uq_payment_order UNIQUE (order_id),
    CONSTRAINT chk_payment_amount CHECK (amount >= 0),
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES `order` (order_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

-- 17. Shopping Cart & Cart Items (Registered Customers)

CREATE TABLE cart (
    cart_id VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_cart PRIMARY KEY (cart_id),
    CONSTRAINT uq_cart_customer UNIQUE (customer_id),
    CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE TABLE cart_item (
    cart_item_id VARCHAR(50) NOT NULL,
    cart_id VARCHAR(50) NOT NULL,
    variant_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cart_item PRIMARY KEY (cart_item_id),
    CONSTRAINT uq_cart_variant UNIQUE (cart_id, variant_id),
    CONSTRAINT chk_cart_item_qty CHECK (quantity > 0),
    CONSTRAINT fk_cartitem_cart FOREIGN KEY (cart_id) REFERENCES cart (cart_id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cartitem_variant FOREIGN KEY (variant_id) REFERENCES product_variant (variant_id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB;

CREATE INDEX idx_cartitem_cart ON cart_item (cart_id);
