-- Gunakan database 'stay_awake_db'
USE stay_awake_db;

-- USERS
-- Contoh data pengguna
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$wN9aR7Gg/fF5d.Z.d5P5..uW.8iZ.z.z.z.z.z.z.z.z.z.z.z.z', 'user'), -- password: userpass123
('Jane Smith', 'jane.smith@example.com', '$2a$10$wN9aR7Gg/fF5d.Z.d5P5..uW.8iZ.z.z.z.z.z.z.z.z.z.z.z.z', 'user'), -- password: userpass123
('Admin User', 'admin@example.com', '$2a$10$wN9aR7Gg/fF5d.Z.d5P5..uW.8iZ.z.z.z.z.z.z.z.z.z.z.z.z', 'admin'); -- password: adminpass123

-- ADDRESSES
-- Contoh data alamat untuk pengguna
INSERT INTO addresses (user_id, phone, address, city, postal_code) VALUES
(1, '081234567890', 'Jl. Contoh No. 10', 'Bandung', '40111'),
(2, '089876543210', 'Jl. Melati Indah No. 5', 'Jakarta', '10120'),
(1, '087766554433', 'Apartemen Sudirman Tower C', 'Jakarta', '10220');

-- CATEGORIES
-- Memasukkan kategori produk. ID akan di-auto-generate.
INSERT INTO categories (name) VALUES
('coffee bags'),
('tea'),
('accessories'),
('bundle'),
('single serve');

-- PRODUCTS
-- Memasukkan detail produk. Harga dan stok diberi nilai default 10.00 dan 100 karena tidak ada di data asli.
-- Nama gambar dibuat berdasarkan nama produk (diubah menjadi huruf kecil, spasi menjadi underscore, karakter khusus dihapus).
INSERT INTO products (name, description, price, image, stock) VALUES
('Medium Roast Coffee Blend', 'Balanced, smooth, and effortlessly sippable - our organic Medium Roast Blend is the go-to medium body cup for everyday moments. With cozy notes of milk chocolate and roasted peanuts, it’s friendly, approachable, and impossible not to love.', 15.50, 'medium_roast_coffee_blend.webp', 150),
('Espresso Dark Roast Coffee Blend', 'Bold, smooth, and never bitter - our organic Espresso Blend is crafted for the perfect shot every time. Rich notes of dark chocolate and toasted nuts make it just as delicious with milk as it is straight up.', 16.00, 'espresso_dark_roast_coffee_blend.webp', 120),
('Light Roast Coffee Blend', 'Bright, smooth, and full of character - our organic Light Roast Blend is made for easy mornings and crisp, clean flavor. With subtle citrus notes and a gentle finish, it’s a refreshing take on your daily brew.', 14.90, 'light_roast_coffee_blend.webp', 180),
('Vanilla Coffee Blend', 'Medium bodied, creamy, and irresistibly smooth - our organic Vanilla Blend brings a hint of flavor to your daily cup. With french vanilla notes layered over a balanced roast, it’s comfort in coffee form', 16.50, 'vanilla_coffee_blend.webp', 100),
('Dark Roast Blend', 'All-nighters encouraged. With this blend, the night is always young. Rich and velvety, toasty and creamy with notes of dark chocolate, sweet honey and toasted walnuts.', 15.75, 'dark_roast_blend.webp', 90),
('Decaf Medium Roast Blend', 'The decaf blend is for those that want the coffee without the energy. Enjoy this blend before bed without interrupting your sleep schedule… Now you can drink coffee all day!', 14.50, 'decaf_medium_roast_blend.webp', 70),
('Half Caff Medium Roast Blend', 'A more relaxed, half-caffeinated blend for when you just want to take it easy. A smooth, sweet and balanced roast with warm notes of toasted almonds, semi-sweet chocolate, butterscotch candy and raisins. Meow.', 15.00, 'half_caff_medium_roast_blend.webp', 110),
('Matcha Green Tea Powder', 'Vibrant, smooth, and stone-ground to perfection—our organic ceremonial grade a Matcha is made from premium Japanese green tea for a clean, uplifting boost. With a naturally sweet, earthy flavor and no bitterness, it’s your new go-to for calm, focused energy.', 20.00, 'matcha_green_tea_powder.webp', 200),
('Vanilla Matcha Green Tea Powder', 'A smooth, subtly sweet twist on our signature matcha—infused with warm vanilla for a cozy, comforting sip. It’s earthy, creamy, and the perfect hint of flavor added to your daily ritual.', 21.00, 'vanilla_matcha_green_tea_powder.webp', 80),
('Chocolate Matcha Green Tea Powder', 'Chocolate and matcha come together in a smooth blend with just the right hint of richness. It’s a comforting twist on your everyday matcha.', 22.00, 'chocolate_matcha_green_tea_powder.webp', 60),
('Chai Oat Milk Latte Powder', 'Our chai is a vegan blend made with oat drink, natural vanilla and cinnamon, giving you the very best flavor and quality. Enjoy this sweet, aromatic drink hot or iced, in rain or shine.', 18.00, 'chai_oat_milk_latte_powder.webp', 130),
('Matcha Ceramic Candle', 'Fresh, calming, and subtly earthy—the Chamberlain Coffee Matcha Candle captures the serene essence of your favorite green tea ritual. Housed in a sleek ceramic vessel, it’s a scent made for an everyday pick-me-up.- soy wax- 45 hour burn time- hand painted/glazed so variations might occur', 25.00, 'matcha_ceramic_candle.webp', 40),
('Matcha Green Tea Powder Starter Pack', 'The perfect entry point to your matcha ritual—complete with our signature matcha, glass mason jar, electric whisk, and reusable straws. Designed to elevate your daily routine, this set brings the full café experience to your countertop.', 60.00, 'matcha_green_tea_powder_starter_pack.webp', 30),
('Cold Brew Elephant Large Coffee Bags', 'Crafted for cold brew perfection, our organic XL Bags feature a bold, slow-steeped blend designed to bring out deep, chocolatey notes with a smooth finish. Each oversized bag makes 4 cups of coffee and delivers full-bodied flavor that’s perfect over ice, every single time.', 18.00, 'cold_brew_elephant_large_coffee_bags.webp', 90),
('Medium Roast Cold Brew Singles', 'Smooth, balanced, and endlessly drinkable—our organic Medium Roast Single Serve is your go-to for an elevated everyday brew. With notes of milk chocolate and toasted nuts, it’s a classic cup made effortlessly convenient.', 12.00, 'medium_roast_cold_brew_singles.webp', 200),
('Flavored Variety Cold Brew Singles', 'Discover a curated selection of our signature flavored blends in convenient single serve form—designed to be enjoyed hot or iced. Rich, balanced, and effortlessly versatile, this variety pack brings a refined twist to your daily coffee ritual.', 14.00, 'flavored_variety_cold_brew_singles.webp', 100),
('Vanilla Cold Brew Coffee Singles', 'Cozy, creamy, and perfectly smooth, bringing a hint of sweetness to your daily brew. Designed for effortless brewing hot or iced, it’s a comforting classic with a modern twist.', 13.50, 'vanilla_cold_brew_coffee_singles.webp', 110),
('Espresso Cold Brew Singles', 'Chamberlain Coffee’s Best Selling Fancy Mouse blend now in single serve. Perfect for when you need that extra kick to wake up, or if you are one of those badasses that really enjoy the taste of strong black coffee. Fancy Mouse is always down to get shit done. Caffeine level: 5/5', 13.00, 'espresso_cold_brew_singles.webp', 80),
('Cake Batter Cold Brew Singles', 'With notes of birthday cake and vanilla buttercream frosting, our cake batter blend makes every cup taste like a party. Brew in 8oz of water in the fridge overnight for cold brew or brew in hot water for 5+ minutes for a piping hot cup of coffee. Cheers!', 14.00, 'cake_batter_cold_brew_singles.webp', 75),
('Vanilla Cold Brew Elephant Large', 'Rich, smooth, and subtly flavored—our organic Vanilla Cold Brew XL Bags make it easy to brew café-quality coffee at home. Infused with natural vanilla flavor, each oversized bag makes 4 cups of coffee and delivers a bold, refreshing brew that’s perfect over ice.', 19.00, 'vanilla_cold_brew_elephant_large.webp', 65),
('Organic Cold Brew Coffee Starter Pack', 'Everything you need to kickstart your cold brew ritual, including single serve coffee packets and our signature mason jar for effortless, at-home brewing. All the flavor of a delicious cold brew, with none of the work. Includes: variety single serve, mason jar, stainless steel straw pack', 55.00, 'organic_cold_brew_coffee_starter_pack.webp', 25),
('Double Wall Mug', 'Crafted to keep your drinks hot or cold on the inside while still being able to hold the outside, this double wall mug blends thoughtful design with everyday function. With its clear, modern design and comfortable feel, it elevates every sip.', 28.00, 'double_wall_mug.webp', 50),
('Can cup set', 'Details: Material: glass Size: 16oz Comes in a set of 4 This cup is not heat resistant and is for cold beverages only. We recommend our Chamberlain Coffee Mug for hot beverages.', 35.00, 'can_cup_set.webp', 30),
('Square Cold Brew Mason Jar', 'A timeless take on everyday sipping, this square mason jar is equal parts functional and nostalgic. Designed for iced matcha, cold brew, and everything in between, it adds a signature touch to your daily ritual.', 12.00, 'square_cold_brew_mason_jar.webp', 70),
('Navy Everywhere Tote', 'Your go-to carryall for coffee runs, farmers markets, and everything in between. Made from sturdy canvas in a rich navy hue, this tote is equal parts functional and effortlessly cool. - cotton canvas - hand washing is recommended - 20.5" wide x 13" tall x 7" deep', 40.00, 'navy_everywhere_tote.webp', 45),
('Mocha Ceramic Mug', 'Take your favorite coffee and matcha on the go in style. -handwash recommend-10oz', 20.00, 'mocha_ceramic_mug.webp', 60),
('Navy Cup & Saucer', 'Your morning coffee routine, elevated in our signature navy blue. - dishwasher safe - 7.5oz', 25.00, 'navy_cup_&_saucer.webp', 35),
('Large Cold Brew Mason Jar', 'Details: Material: glass Size: 25oz This Mason Jar is not heat resistant and is for cold beverages only. We recommend our Chamberlain Coffee Mug for hot beverages.', 15.00, 'large_cold_brew_mason_jar.webp', 55);

-- PRODUCT_CATEGORIES
-- Menghubungkan produk dengan kategori mereka. Menggunakan subquery untuk mendapatkan ID yang benar.
INSERT INTO product_categories (product_id, category_id) VALUES
((SELECT product_id FROM products WHERE name = 'Medium Roast Coffee Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Espresso Dark Roast Coffee Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Light Roast Coffee Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Vanilla Coffee Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Dark Roast Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Decaf Medium Roast Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Half Caff Medium Roast Blend'), (SELECT category_id FROM categories WHERE name = 'coffee bags')),
((SELECT product_id FROM products WHERE name = 'Matcha Green Tea Powder'), (SELECT category_id FROM categories WHERE name = 'tea')),
((SELECT product_id FROM products WHERE name = 'Vanilla Matcha Green Tea Powder'), (SELECT category_id FROM categories WHERE name = 'tea')),
((SELECT product_id FROM products WHERE name = 'Chocolate Matcha Green Tea Powder'), (SELECT category_id FROM categories WHERE name = 'tea')),
((SELECT product_id FROM products WHERE name = 'Chai Oat Milk Latte Powder'), (SELECT category_id FROM categories WHERE name = 'tea')),
((SELECT product_id FROM products WHERE name = 'Matcha Ceramic Candle'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Matcha Green Tea Powder Starter Pack'), (SELECT category_id FROM categories WHERE name = 'bundle')),
((SELECT product_id FROM products WHERE name = 'Cold Brew Elephant Large Coffee Bags'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Medium Roast Cold Brew Singles'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Flavored Variety Cold Brew Singles'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Vanilla Cold Brew Coffee Singles'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Espresso Cold Brew Singles'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Cake Batter Cold Brew Singles'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Vanilla Cold Brew Elephant Large'), (SELECT category_id FROM categories WHERE name = 'single serve')),
((SELECT product_id FROM products WHERE name = 'Organic Cold Brew Coffee Starter Pack'), (SELECT category_id FROM categories WHERE name = 'bundle')),
((SELECT product_id FROM products WHERE name = 'Double Wall Mug'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Can cup set'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Square Cold Brew Mason Jar'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Navy Everywhere Tote'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Mocha Ceramic Mug'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Navy Cup & Saucer'), (SELECT category_id FROM categories WHERE name = 'accessories')),
((SELECT product_id FROM products WHERE name = 'Large Cold Brew Mason Jar'), (SELECT category_id FROM categories WHERE name = 'accessories'));

-- CARTS
-- Membuat keranjang belanja untuk setiap pengguna
INSERT INTO carts (user_id) VALUES
(1),
(2);

-- CART ITEMS
-- Menambahkan beberapa item ke keranjang belanja
INSERT INTO cart_items (cart_id, product_id, quantity) VALUES
((SELECT cart_id FROM carts WHERE user_id = 1), (SELECT product_id FROM products WHERE name = 'Medium Roast Coffee Blend'), 2),
((SELECT cart_id FROM carts WHERE user_id = 1), (SELECT product_id FROM products WHERE name = 'Matcha Green Tea Powder'), 1),
((SELECT cart_id FROM carts WHERE user_id = 2), (SELECT product_id FROM products WHERE name = 'Espresso Dark Roast Coffee Blend'), 1),
((SELECT cart_id FROM carts WHERE user_id = 2), (SELECT product_id FROM products WHERE name = 'Mocha Ceramic Mug'), 1);

-- ORDERS
-- Membuat beberapa pesanan
INSERT INTO orders (user_id, address_id, total_price, status, created_at) VALUES
(1, 1, 47.00, 'completed', '2025-06-01 10:00:00'),
(2, 2, 36.00, 'pending', '2025-06-05 14:30:00'),
(1, 3, 100.00, 'pending', '2025-06-08 09:15:00');

-- ORDER ITEMS
-- Menambahkan item ke pesanan
INSERT INTO order_items (order_id, product_id, quantity, total_price) VALUES
(1, (SELECT product_id FROM products WHERE name = 'Medium Roast Coffee Blend'), 2, 31.00),
(1, (SELECT product_id FROM products WHERE name = 'Matcha Green Tea Powder'), 1, 20.00),
(2, (SELECT product_id FROM products WHERE name = 'Espresso Dark Roast Coffee Blend'), 1, 16.00),
(2, (SELECT product_id FROM products WHERE name = 'Mocha Ceramic Mug'), 1, 20.00),
(3, (SELECT product_id FROM products WHERE name = 'Organic Cold Brew Coffee Starter Pack'), 1, 55.00),
(3, (SELECT product_id FROM products WHERE name = 'Double Wall Mug'), 1, 28.00);


-- PAYMENTS
-- Contoh data pembayaran untuk pesanan
INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at) VALUES
(1, 'bank_transfer', 'paid', 'TRX20250601-001', 47.00, '2025-06-01 10:15:00'),
(2, 'cc', 'pending', 'TRX20250605-002', 36.00, NULL); -- Belum dibayar, jadi paid_at NULL
-- Pesanan ketiga (order_id=3) belum memiliki pembayaran.

-- SHIPMENT
-- Contoh data pengiriman
INSERT INTO shipment (order_id, courier, status, shipped_at, delivered_at) VALUES
(1, 'JNE', 'delivered', '2025-06-02 09:00:00', '2025-06-04 15:30:00'),
(2, 'SiCepat', 'packing', NULL, NULL); -- Belum dikirim
-- Pesanan ketiga (order_id=3) belum memiliki data pengiriman.

-- REVIEWS
-- Contoh data ulasan produk
INSERT INTO reviews (user_id, product_id, rating, comment, created_at) VALUES
(1, (SELECT product_id FROM products WHERE name = 'Medium Roast Coffee Blend'), 5, 'Kopi favorit saya, rasanya enak dan smooth!', '2025-06-05 11:00:00'),
(2, (SELECT product_id FROM products WHERE name = 'Matcha Green Tea Powder'), 4, 'Matchanya enak, tapi kemasan agak ringkih.', '2025-06-06 16:00:00'),
(1, (SELECT product_id FROM products WHERE name = 'Double Wall Mug'), 5, 'Mug yang keren, bisa menjaga minuman tetap panas atau dingin!', '2025-06-09 10:00:00');