-- BrightBuy Seed Data (matches updated schema.sql)
-- Categories: 12 | Products: 43 | Variants: 60
USE brightbuy;

-- ================= CATEGORY =================
INSERT INTO category (category_id, category_name, description) VALUES ('CAT01', 'Mobiles', 'Smartphones and feature phones');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT02', 'Laptops', 'Laptops and notebooks');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT03', 'Audio', 'Headphones, earbuds, speakers');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT04', 'Cameras', 'Digital cameras and accessories');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT05', 'Gaming', 'Gaming consoles and accessories');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT06', 'Wearables', 'Smartwatches and fitness bands');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT07', 'SmartHome', 'Smart home and IoT devices');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT08', 'Tablets', 'Tablets and e-readers');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT09', 'ActionFigures', 'Action figures and collectibles');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT10', 'BoardGames', 'Board games and puzzles');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT11', 'EduToys', 'Educational and STEM toys');
INSERT INTO category (category_id, category_name, description) VALUES ('CAT12', 'RCVehicles', 'Remote control vehicles');

-- Total products: 43
-- ================= PRODUCT =================
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD001', 'Zynox Phone X1', 'Zynox', 'Flagship smartphone with OLED display', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD002', 'Zynox Phone X1 Lite', 'Zynox', 'Budget smartphone with dual camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD003', 'Orbit S9', 'Orbit', 'Mid-range smartphone with fast charging', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD004', 'Orbit S9 Pro', 'Orbit', 'Premium smartphone with triple camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD005', 'Vantel Basic', 'Vantel', 'Simple feature phone for calls and texts', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD006', 'Coreline Air 14', 'Coreline', 'Lightweight ultrabook for everyday use', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD007', 'Coreline Pro 15', 'Coreline', 'High-performance laptop for professionals', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD008', 'Nimbus Book 13', 'Nimbus', 'Compact laptop with all-day battery', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD009', 'Nimbus Gamer G5', 'Nimbus', 'Gaming laptop with dedicated GPU', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD010', 'SoundWave Buds Pro', 'SoundWave', 'Noise-cancelling wireless earbuds', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD011', 'SoundWave Buds Lite', 'SoundWave', 'Affordable wireless earbuds', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD012', 'BassCore Headphones', 'BassCore', 'Over-ear headphones with deep bass', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD013', 'BassCore Mini Speaker', 'BassCore', 'Portable Bluetooth speaker', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD014', 'PixelShot D200', 'PixelShot', 'Entry-level DSLR camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD015', 'PixelShot Mirror M5', 'PixelShot', 'Compact mirrorless camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD016', 'ActionCam GO', 'ActionCam', 'Waterproof action camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD017', 'PixelShot Tripod Kit', 'PixelShot', 'Adjustable camera tripod', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD018', 'PlayNext Console X', 'PlayNext', 'Next-gen home gaming console', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD019', 'PlayNext Controller', 'PlayNext', 'Wireless game controller', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD020', 'PlayNext Handheld', 'PlayNext', 'Portable handheld gaming device', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD021', 'GripPro Racing Wheel', 'GripPro', 'Racing wheel with pedals', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD022', 'PulseFit Watch 3', 'PulseFit', 'Smartwatch with heart rate monitor', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD023', 'PulseFit Band Lite', 'PulseFit', 'Basic fitness tracker band', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD024', 'PulseFit Watch Kids', 'PulseFit', 'Smartwatch designed for children', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD025', 'HomeSync Speaker', 'HomeSync', 'Smart speaker with voice assistant', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD026', 'HomeSync Plug', 'HomeSync', 'Wi-Fi smart plug', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD027', 'HomeSync Cam', 'HomeSync', 'Indoor security camera', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD028', 'SlatePad 10', 'SlatePad', '10-inch tablet for browsing and media', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD029', 'SlatePad Mini', 'SlatePad', 'Compact 8-inch tablet', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD030', 'SlatePad Kids', 'SlatePad', 'Durable tablet designed for children', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD031', 'HeroForge Warrior', 'HeroForge', 'Poseable action figure, 6 inch', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD032', 'HeroForge Dragon Beast', 'HeroForge', 'Collectible dragon figure', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD033', 'GalaxyToys Star Fighter', 'GalaxyToys', 'Spaceship collectible model', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD034', 'GalaxyToys Robot Set', 'GalaxyToys', 'Transforming robot figure set', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD035', 'BrainBox Strategy', 'BrainBox', 'Classic strategy board game', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD036', 'BrainBox Family Fun', 'BrainBox', 'Family board game for all ages', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD037', 'PuzzleWorks 1000pc', 'PuzzleWorks', '1000-piece jigsaw puzzle', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD038', 'SmartBuild Blocks', 'SmartBuild', 'STEM building block set', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD039', 'SmartBuild Circuit Kit', 'SmartBuild', 'Beginner electronics learning kit', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD040', 'LearnLab Microscope', 'LearnLab', 'Kids'' science microscope kit', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD041', 'TurboRC Racer', 'TurboRC', 'High-speed remote control car', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD042', 'TurboRC Monster Truck', 'TurboRC', 'Off-road remote control truck', TRUE, NOW());
INSERT INTO product (product_id, product_name, brand, description, is_active, created_at) VALUES ('PRD043', 'SkyDrone Mini', 'SkyDrone', 'Beginner-friendly mini drone', TRUE, NOW());

-- ================= PRODUCT_CATEGORY =================
INSERT INTO product_category (product_id, category_id) VALUES ('PRD001', 'CAT01');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD002', 'CAT01');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD003', 'CAT01');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD004', 'CAT01');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD005', 'CAT01');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD006', 'CAT02');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD007', 'CAT02');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD008', 'CAT02');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD009', 'CAT02');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD010', 'CAT03');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD011', 'CAT03');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD012', 'CAT03');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD013', 'CAT03');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD014', 'CAT04');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD015', 'CAT04');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD016', 'CAT04');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD017', 'CAT04');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD018', 'CAT05');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD019', 'CAT05');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD020', 'CAT05');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD021', 'CAT05');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD022', 'CAT06');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD023', 'CAT06');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD024', 'CAT06');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD025', 'CAT07');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD026', 'CAT07');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD027', 'CAT07');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD028', 'CAT08');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD029', 'CAT08');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD030', 'CAT08');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD031', 'CAT09');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD032', 'CAT09');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD033', 'CAT09');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD034', 'CAT09');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD035', 'CAT10');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD036', 'CAT10');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD037', 'CAT10');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD038', 'CAT11');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD039', 'CAT11');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD040', 'CAT11');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD041', 'CAT12');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD042', 'CAT12');
INSERT INTO product_category (product_id, category_id) VALUES ('PRD043', 'CAT12');

-- ================= PRODUCT_VARIANT =================
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR001', 'PRD001', 'SKU-PRD001-01', '64GB Black', 299.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR002', 'PRD001', 'SKU-PRD001-02', '128GB Black', 349.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR003', 'PRD001', 'SKU-PRD001-03', '128GB Silver', 349.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR004', 'PRD002', 'SKU-PRD002-01', '32GB Blue', 179.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR005', 'PRD002', 'SKU-PRD002-02', '64GB Blue', 199.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR006', 'PRD003', 'SKU-PRD003-01', '128GB Gray', 279.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR007', 'PRD004', 'SKU-PRD004-01', '256GB Black', 459.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR008', 'PRD004', 'SKU-PRD004-02', '256GB Gold', 459.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR009', 'PRD005', 'SKU-PRD005-01', 'Default', 39.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR010', 'PRD006', 'SKU-PRD006-01', '8GB/256GB', 599.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR011', 'PRD006', 'SKU-PRD006-02', '16GB/512GB', 749.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR012', 'PRD007', 'SKU-PRD007-01', '16GB/512GB', 999.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR013', 'PRD007', 'SKU-PRD007-02', '32GB/1TB', 1299.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR014', 'PRD008', 'SKU-PRD008-01', '8GB/256GB', 549.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR015', 'PRD009', 'SKU-PRD009-01', '16GB/1TB', 1199.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR016', 'PRD010', 'SKU-PRD010-01', 'Black', 89.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR017', 'PRD010', 'SKU-PRD010-02', 'White', 89.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR018', 'PRD011', 'SKU-PRD011-01', 'Default', 39.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR019', 'PRD012', 'SKU-PRD012-01', 'Black', 69.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR020', 'PRD012', 'SKU-PRD012-02', 'Red', 69.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR021', 'PRD013', 'SKU-PRD013-01', 'Default', 49.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR022', 'PRD014', 'SKU-PRD014-01', 'Body Only', 449.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR023', 'PRD014', 'SKU-PRD014-02', 'With Lens', 549.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR024', 'PRD015', 'SKU-PRD015-01', 'Default', 699.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR025', 'PRD016', 'SKU-PRD016-01', 'Standard', 149.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR026', 'PRD016', 'SKU-PRD016-02', 'Bundle', 199.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR027', 'PRD017', 'SKU-PRD017-01', 'Default', 29.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR028', 'PRD018', 'SKU-PRD018-01', '500GB', 399.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR029', 'PRD018', 'SKU-PRD018-02', '1TB', 449.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR030', 'PRD019', 'SKU-PRD019-01', 'Black', 49.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR031', 'PRD019', 'SKU-PRD019-02', 'Blue', 49.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR032', 'PRD020', 'SKU-PRD020-01', 'Default', 199.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR033', 'PRD021', 'SKU-PRD021-01', 'Default', 129.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR034', 'PRD022', 'SKU-PRD022-01', 'Black', 129.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR035', 'PRD022', 'SKU-PRD022-02', 'Rose Gold', 139.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR036', 'PRD023', 'SKU-PRD023-01', 'Default', 39.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR037', 'PRD024', 'SKU-PRD024-01', 'Blue', 59.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR038', 'PRD024', 'SKU-PRD024-02', 'Pink', 59.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR039', 'PRD025', 'SKU-PRD025-01', 'Default', 79.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR040', 'PRD026', 'SKU-PRD026-01', 'Single', 14.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR041', 'PRD026', 'SKU-PRD026-02', '2-Pack', 24.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR042', 'PRD027', 'SKU-PRD027-01', 'Default', 59.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR043', 'PRD028', 'SKU-PRD028-01', '64GB', 249.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR044', 'PRD028', 'SKU-PRD028-02', '128GB', 299.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR045', 'PRD029', 'SKU-PRD029-01', 'Default', 199.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR046', 'PRD030', 'SKU-PRD030-01', 'Default', 129.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR047', 'PRD031', 'SKU-PRD031-01', 'Default', 19.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR048', 'PRD032', 'SKU-PRD032-01', 'Default', 29.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR049', 'PRD033', 'SKU-PRD033-01', 'Default', 24.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR050', 'PRD034', 'SKU-PRD034-01', 'Default', 34.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR051', 'PRD035', 'SKU-PRD035-01', 'Default', 24.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR052', 'PRD036', 'SKU-PRD036-01', 'Default', 19.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR053', 'PRD037', 'SKU-PRD037-01', 'Default', 14.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR054', 'PRD038', 'SKU-PRD038-01', 'Default', 39.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR055', 'PRD039', 'SKU-PRD039-01', 'Default', 44.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR056', 'PRD040', 'SKU-PRD040-01', 'Default', 29.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR057', 'PRD041', 'SKU-PRD041-01', 'Red', 49.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR058', 'PRD041', 'SKU-PRD041-02', 'Green', 49.99, FALSE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR059', 'PRD042', 'SKU-PRD042-01', 'Default', 59.99, TRUE, NOW());
INSERT INTO product_variant (variant_id, product_id, sku, variant_name, price, is_default, created_at) VALUES ('VAR060', 'PRD043', 'SKU-PRD043-01', 'Default', 69.99, TRUE, NOW());
-- Total variants: 60

-- ================= PRODUCT_ATTRIBUTE =================
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0001', 'VAR001', 'storage', '64GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0002', 'VAR001', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0003', 'VAR002', 'storage', '128GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0004', 'VAR002', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0005', 'VAR003', 'storage', '128GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0006', 'VAR003', 'color', 'Silver');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0007', 'VAR004', 'storage', '32GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0008', 'VAR004', 'color', 'Blue');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0009', 'VAR005', 'storage', '64GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0010', 'VAR005', 'color', 'Blue');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0011', 'VAR006', 'storage', '128GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0012', 'VAR006', 'color', 'Gray');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0013', 'VAR007', 'storage', '256GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0014', 'VAR007', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0015', 'VAR008', 'storage', '256GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0016', 'VAR008', 'color', 'Gold');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0017', 'VAR010', 'ram', '8GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0018', 'VAR010', 'storage', '256GB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0019', 'VAR011', 'ram', '16GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0020', 'VAR011', 'storage', '512GB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0021', 'VAR012', 'ram', '16GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0022', 'VAR012', 'storage', '512GB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0023', 'VAR013', 'ram', '32GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0024', 'VAR013', 'storage', '1TB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0025', 'VAR014', 'ram', '8GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0026', 'VAR014', 'storage', '256GB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0027', 'VAR015', 'ram', '16GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0028', 'VAR015', 'storage', '1TB SSD');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0029', 'VAR016', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0030', 'VAR017', 'color', 'White');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0031', 'VAR019', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0032', 'VAR020', 'color', 'Red');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0033', 'VAR022', 'kit', 'Body Only');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0034', 'VAR023', 'kit', 'With Lens');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0035', 'VAR025', 'edition', 'Standard');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0036', 'VAR026', 'edition', 'Bundle');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0037', 'VAR028', 'storage', '500GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0038', 'VAR029', 'storage', '1TB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0039', 'VAR030', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0040', 'VAR031', 'color', 'Blue');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0041', 'VAR034', 'color', 'Black');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0042', 'VAR035', 'color', 'Rose Gold');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0043', 'VAR037', 'color', 'Blue');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0044', 'VAR038', 'color', 'Pink');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0045', 'VAR040', 'pack', 'Single');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0046', 'VAR041', 'pack', '2-Pack');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0047', 'VAR043', 'storage', '64GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0048', 'VAR044', 'storage', '128GB');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0049', 'VAR057', 'color', 'Red');
INSERT INTO product_attribute (attribute_id, variant_id, attribute_name, attribute_value) VALUES ('ATT0050', 'VAR058', 'color', 'Green');
-- Total attribute rows: 50

INSERT INTO `user` (user_id, email, password_hash, first_name, last_name, role) VALUES
('USR001', 'alex.rivera@example.com', 'temp_hash_1', 'Alex', 'Rivera', 'customer'),
('USR002', 'maria.gomez@example.com', 'temp_hash_2', 'Maria', 'Gomez', 'customer'),
('USR003', 'james.lee@example.com', 'temp_hash_3', 'James', 'Lee', 'customer'),
('USR004', 'priya.patel@example.com', 'temp_hash_4', 'Priya', 'Patel', 'customer'),
('USR005', 'tom.walker@example.com', 'temp_hash_5', 'Tom', 'Walker', 'customer');

INSERT INTO customer (customer_id, user_id) VALUES
('CUST001', 'USR001'),
('CUST002', 'USR002'),
('CUST003', 'USR003'),
('CUST004', 'USR004'),
('CUST005', 'USR005');

-- Dummy product feedback

INSERT INTO product_feedback (feedback_id, product_id, customer_id, rating, review, created_at) VALUES
('FB001', 'PRD001', 'CUST001', 5, 'Amazing display and camera quality. Worth every dollar.', NOW()),
('FB002', 'PRD001', 'CUST002', 4, 'Great phone, battery could last a bit longer.', NOW()),
('FB003', 'PRD002', 'CUST003', 4, 'Good budget option, camera is decent for the price.', NOW()),
('FB004', 'PRD003', 'CUST004', 3, 'Average performance, expected a bit more for the price.', NOW()),
('FB005', 'PRD004', 'CUST005', 5, 'Triple camera setup is fantastic, very happy with this purchase.', NOW()),
('FB006', 'PRD006', 'CUST001', 5, 'Super lightweight, perfect for daily carry.', NOW()),
('FB007', 'PRD007', 'CUST002', 5, 'Handles heavy workloads without breaking a sweat.', NOW()),
('FB008', 'PRD009', 'CUST003', 4, 'Great for gaming, gets a little warm under load.', NOW()),
('FB009', 'PRD010', 'CUST004', 5, 'Noise cancellation is excellent, very comfortable too.', NOW()),
('FB010', 'PRD012', 'CUST005', 4, 'Solid bass, exactly what I was looking for.', NOW()),
('FB011', 'PRD014', 'CUST001', 4, 'Good entry-level DSLR, easy to learn on.', NOW()),
('FB012', 'PRD018', 'CUST002', 5, 'Loading times are incredibly fast on this console.', NOW()),
('FB013', 'PRD019', 'CUST003', 3, 'Controller feels a bit small for larger hands.', NOW()),
('FB014', 'PRD022', 'CUST004', 5, 'Heart rate tracking is very accurate during workouts.', NOW()),
('FB015', 'PRD025', 'CUST005', 4, 'Voice assistant responds quickly, sound quality is decent.', NOW()),
('FB016', 'PRD028', 'CUST001', 4, 'Great tablet for reading and browsing, screen is crisp.', NOW()),
('FB017', 'PRD031', 'CUST002', 5, 'My kid loves this action figure, well made and durable.', NOW()),
('FB018', 'PRD035', 'CUST003', 4, 'Fun strategy game for family game nights.', NOW()),
('FB019', 'PRD038', 'CUST004', 5, 'Great STEM toy, kept my daughter engaged for hours.', NOW()),
('FB020', 'PRD041', 'CUST005', 4, 'Fast RC car, holds up well on rough terrain.', NOW());

-- Dummy inventory data
INSERT INTO inventory (inventory_id, variant_id, quantity_on_hand, reorder_level, last_restocked_at) VALUES
('INV001', 'VAR001', 18, 10, NOW()),
('INV002', 'VAR002', 31, 10, NOW()),
('INV003', 'VAR003', 44, 10, NOW()),
('INV004', 'VAR004', 57, 10, NOW()),
('INV005', 'VAR005', 10, 10, NOW()),
('INV006', 'VAR006', 23, 10, NOW()),
('INV007', 'VAR007', 0, 10, NOW()),
('INV008', 'VAR008', 49, 10, NOW()),
('INV009', 'VAR009', 62, 10, NOW()),
('INV010', 'VAR010', 15, 10, NOW()),
('INV011', 'VAR011', 28, 10, NOW()),
('INV012', 'VAR012', 41, 10, NOW()),
('INV013', 'VAR013', 54, 10, NOW()),
('INV014', 'VAR014', 0, 10, NOW()),
('INV015', 'VAR015', 20, 10, NOW()),
('INV016', 'VAR016', 33, 10, NOW()),
('INV017', 'VAR017', 46, 10, NOW()),
('INV018', 'VAR018', 59, 10, NOW()),
('INV019', 'VAR019', 12, 10, NOW()),
('INV020', 'VAR020', 25, 10, NOW()),
('INV021', 'VAR021', 0, 10, NOW()),
('INV022', 'VAR022', 51, 10, NOW()),
('INV023', 'VAR023', 64, 10, NOW()),
('INV024', 'VAR024', 17, 10, NOW()),
('INV025', 'VAR025', 30, 10, NOW()),
('INV026', 'VAR026', 43, 10, NOW()),
('INV027', 'VAR027', 56, 10, NOW()),
('INV028', 'VAR028', 0, 10, NOW()),
('INV029', 'VAR029', 22, 10, NOW()),
('INV030', 'VAR030', 35, 10, NOW()),
('INV031', 'VAR031', 48, 10, NOW()),
('INV032', 'VAR032', 61, 10, NOW()),
('INV033', 'VAR033', 14, 10, NOW()),
('INV034', 'VAR034', 27, 10, NOW()),
('INV035', 'VAR035', 0, 10, NOW()),
('INV036', 'VAR036', 53, 10, NOW()),
('INV037', 'VAR037', 6, 10, NOW()),
('INV038', 'VAR038', 19, 10, NOW()),
('INV039', 'VAR039', 32, 10, NOW()),
('INV040', 'VAR040', 45, 10, NOW()),
('INV041', 'VAR041', 58, 10, NOW()),
('INV042', 'VAR042', 0, 10, NOW()),
('INV043', 'VAR043', 24, 10, NOW()),
('INV044', 'VAR044', 37, 10, NOW()),
('INV045', 'VAR045', 50, 10, NOW()),
('INV046', 'VAR046', 63, 10, NOW()),
('INV047', 'VAR047', 16, 10, NOW()),
('INV048', 'VAR048', 29, 10, NOW()),
('INV049', 'VAR049', 0, 10, NOW()),
('INV050', 'VAR050', 55, 10, NOW()),
('INV051', 'VAR051', 8, 10, NOW()),
('INV052', 'VAR052', 21, 10, NOW()),
('INV053', 'VAR053', 34, 10, NOW()),
('INV054', 'VAR054', 47, 10, NOW()),
('INV055', 'VAR055', 60, 10, NOW()),
('INV056', 'VAR056', 0, 10, NOW()),
('INV057', 'VAR057', 26, 10, NOW()),
('INV058', 'VAR058', 39, 10, NOW()),
('INV059', 'VAR059', 52, 10, NOW()),
('INV060', 'VAR060', 5, 10, NOW());