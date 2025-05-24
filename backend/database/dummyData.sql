-- USERS
INSERT INTO users (name, email, password, role) VALUES
('Alice Johnson', 'alice@example.com', 'passwordhash1', 'user'),
('Bob Smith', 'bob@example.com', 'passwordhash2', 'user'),
('Charlie Admin', 'charlie.admin@example.com', 'passwordhash3', 'admin'),
('Diana Fox', 'diana.fox@example.com', 'passwordhash4', 'user'),
('Evan White', 'evan.white@example.com', 'passwordhash5', 'user'),
('Fiona Green', 'fiona.green@example.com', 'passwordhash6', 'admin'),
('George Black', 'george.black@example.com', 'passwordhash7', 'user'),
('Hannah Gray', 'hannah.gray@example.com', 'passwordhash8', 'user'),
('Irene Gold', 'irene.gold@example.com', 'passwordhash9', 'user'),
('John Blue', 'john.blue@example.com', 'passwordhash10', 'admin');

-- ADDRESSES
INSERT INTO addresses (user_id, phone, address, city, postal_code) VALUES
(1, '081234567890', 'Jl. Merdeka No. 10', 'Jakarta', '10110'),
(1, '081234567891', 'Jl. Sudirman No. 5', 'Jakarta', '10220'),
(2, '082345678901', 'Jl. Diponegoro No. 12', 'Bandung', '40115'),
(3, '083456789012', 'Jl. Pahlawan No. 9', 'Surabaya', '60213'),
(4, '084567890123', 'Jl. Garuda No. 8', 'Medan', '20115'),
(5, '085678901234', 'Jl. Raya No. 7', 'Denpasar', '80115'),
(6, '086789012345', 'Jl. Cendana No. 6', 'Yogyakarta', '55115'),
(7, '087890123456', 'Jl. Kuning No. 4', 'Malang', '65112'),
(8, '088901234567', 'Jl. Merapi No. 3', 'Solo', '57115'),
(9, '089012345678', 'Jl. Taman No. 11', 'Semarang', '50115');

-- CATEGORIES
INSERT INTO categories (name) VALUES
('Coffee'),
('Tea'),
('Merchandise'),
('Accessories'),
('Beverages'),
('Kitchen Appliances');

-- PRODUCTS
INSERT INTO products (name, description, price, image, stock) VALUES
('Arabica Coffee Beans', 'Premium Arabica coffee beans, 500g.', 150000.00, 'arabica.jpg', 50),
('Green Tea Loose Leaf', 'Organic green tea from Japan, 200g.', 80000.00, 'greentea.jpg', 100),
('Stay Awake Mug', 'Ceramic coffee mug with logo.', 75000.00, 'mug.jpg', 150),
('Coffee Grinder', 'Manual hand grinder for coffee.', 300000.00, 'grinder.jpg', 30),
('Espresso Machine', 'High-end espresso machine for home use.', 3500000.00, 'espresso_machine.jpg', 10),
('Tea Pot', 'Glass tea pot with infuser, 1L.', 200000.00, 'teapot.jpg', 50),
('Coffee Beans Storage Jar', 'Airtight jar for coffee storage.', 150000.00, 'storage_jar.jpg', 200),
('Electric Kettle', 'Fast boiling electric kettle, 1.7L.', 250000.00, 'electric_kettle.jpg', 80),
('Tea Infuser', 'Stainless steel tea infuser for loose leaf tea.', 30000.00, 'infuser.jpg', 300),
('Coffee Cups Set', 'Set of 4 ceramic coffee cups.', 120000.00, 'coffee_cups.jpg', 70);

-- MANY-TO-MANY: PRODUCTS ↔ CATEGORIES
INSERT INTO product_categories (product_id, category_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 6),
(6, 2), (7, 3), (8, 4), (9, 5), (10, 4),
(1, 5), (2, 5), (3, 6);

-- CARTS
INSERT INTO carts (user_id) VALUES
(1), (2), (3), (4), (5),
(6), (7), (8), (9), (10);

-- CART ITEMS
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
(1, 1, 2), (1, 3, 1), (2, 2, 3), (3, 4, 2), (4, 5, 1),
(5, 6, 1), (6, 7, 2), (7, 8, 1), (8, 9, 3), (9, 10, 1);

-- ORDERS
INSERT INTO orders (user_id, address_id, total_price, status) VALUES
(1, 1, 375000.00, 'pending'),
(2, 3, 240000.00, 'completed'),
(3, 4, 700000.00, 'completed'),
(4, 5, 2000000.00, 'pending'),
(5, 6, 270000.00, 'completed'),
(6, 7, 500000.00, 'completed'),
(7, 8, 300000.00, 'pending'),
(8, 9, 180000.00, 'completed'),
(9, 10, 220000.00, 'pending'),
(10, 2, 150000.00, 'completed');

-- ORDER ITEMS
INSERT INTO order_items (order_id, product_id, quantity, total_price) VALUES
(1, 1, 2, 300000.00), (1, 3, 1, 75000.00), 
(2, 2, 3, 240000.00),
(3, 4, 2, 600000.00), (3, 5, 1, 1000000.00),
(4, 6, 1, 200000.00), 
(5, 7, 1, 150000.00), (5, 8, 1, 120000.00),
(6, 9, 2, 60000.00), (6, 10, 1, 120000.00),
(7, 1, 1, 150000.00), (7, 3, 2, 150000.00),
(8, 2, 3, 240000.00),
(9, 4, 2, 600000.00), (9, 6, 1, 200000.00),
(10, 7, 1, 150000.00);

-- PAYMENTS
INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at) VALUES
(1, 'bank_transfer', 'pending', NULL, 0.00, NULL),
(2, 'cc', 'paid', 'TXN123456789', 240000.00, '2025-05-20 10:00:00'),
(3, 'paypal', 'paid', 'TXN987654321', 1700000.00, '2025-05-21 15:00:00'),
(4, 'qris', 'failed', 'TXN567890123', 0.00, NULL),
(5, 'bank_transfer', 'paid', 'TXN111223344', 270000.00, '2025-05-21 12:00:00'),
(6, 'cc', 'paid', 'TXN654321987', 500000.00, '2025-05-22 14:00:00'),
(7, 'paypal', 'paid', 'TXN222334455', 300000.00, '2025-05-22 16:00:00'),
(8, 'bank_transfer', 'paid', 'TXN333445566', 180000.00, '2025-05-23 09:00:00'),
(9, 'qris', 'paid', 'TXN777888999', 220000.00, '2025-05-23 13:00:00'),
(10, 'paypal', 'paid', 'TXN444555666', 150000.00, '2025-05-24 10:00:00');

-- SHIPMENT
INSERT INTO shipment (order_id, courier, status, shipped_at, delivered_at) VALUES
(1, 'JNE', 'packing', NULL, NULL),
(2, 'SiCepat', 'delivered', '2025-05-21 14:00:00', '2025-05-23 10:00:00'),
(3, 'JNE', 'shipped', '2025-05-21 16:00:00', NULL),
(4, 'Tiki', 'in_transit', '2025-05-22 11:00:00', NULL),
(5, 'SiCepat', 'delivered', '2025-05-22 09:00:00', '2025-05-23 11:00:00'),
(6, 'JNE', 'shipped', '2025-05-22 13:00:00', NULL),
(7, 'Tiki', 'packing', NULL, NULL),
(8, 'SiCepat', 'delivered', '2025-05-23 10:00:00', '2025-05-23 14:00:00'),
(9, 'JNE', 'shipped', '2025-05-23 15:00:00', NULL),
(10, 'SiCepat', 'delivered', '2025-05-24 12:00:00', '2025-05-24 15:00:00');

-- REVIEWS
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(1, 1, 5, 'Coffee beans are fresh and aromatic.'),
(2, 2, 4, 'Nice tea, good flavor but packaging could be better.'),
(1, 3, 5, 'Mug quality is excellent and design is cool.'),
(4, 4, 4, 'Works great for manual grinding, but a bit slow.'),
(5, 5, 5, 'Excellent espresso machine, very satisfied!'),
(6, 6, 4, 'Good tea pot, but could be a bit larger.'),
(7, 7, 3, 'Storage jar is functional, but not airtight enough.'),
(8, 8, 5, 'Kettle is fast and efficient, I love it!'),
(9, 9, 4, 'Nice infuser, but a bit small for larger tea portions.'),
(10, 10, 5, 'Perfect cups for coffee, great value!');
