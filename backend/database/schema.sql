DROP TABLE IF EXISTS PRODUCT;
CREATE TABLE PRODUCT(
    product_id varchar(5) primary key NOT NULL,
    product_name varchar(50) NOT NULL,
    brand varchar(20),
    description varchar(100),
    active boolean NOT NULL,
    created_at datetime NOT NULL
);

DROP TABLE IF EXISTS PRODUCT_VARIANT;
CREATE TABLE PRODUCT_VARIANT(
    variant_id varchar(5) primary key NOT NULL,
    product_id varchar(5) NOT NULL,
    sku varchar(50) unique NOT NULL,
    price numeric(20,3) NOT NULL check (price > 0),
    is_default boolean NOT NULL,
    active boolean NOT NULL,
    foreign key (product_id) references product(product_id),
    index(product_id)
);

DROP TABLE IF EXISTS PRODUCT_ATTRIBUTES;
CREATE TABLE PRODUCT_ATTRIBUTES(
    variant_id varchar(5) NOT NULL productvariant(variant_id),
    attribute_name varchar(20) NOT NULL,
    attribute_value varchar(20) NOT NULL,
    primary key(variant_id, attribute_name),
    foreign key (variant_id) references product_variant(variant_id),
    index(attribute_name, attribute_value)
);

DROP TABLE IF EXISTS CATEGORY;
CREATE TABLE CATEGORY(
    category_id varchar(5) primary key NOT NULL,
    name varchar(20) unique NOT NULL,
    description varchar(100),
    index(name)
);

DROP TABLE IF EXISTS PRODUCT_CATEGORY;
CREATE TABLE PRODUCT_CATEGORY(
    product_id varchar(5) NOT NULL,
    category_id varchar(5) NOT NULL,
    primary key(product_id, category_id),
    foreign key (product_id) references product(product_id),
    foreign key (category_id) references category(category_id)
);
