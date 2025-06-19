-- Hapus database jika sudah ada untuk memulai dari awal (opsional, hati-hati di produksi)
DROP DATABASE IF EXISTS stay_awake_db;
CREATE DATABASE IF NOT EXISTS stay_awake_db;
USE stay_awake_db;

-- USERS
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user'
);

-- ADDRESSES
CREATE TABLE addresses (
  address_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(10),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- CATEGORIES
CREATE TABLE categories (
  category_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  image VARCHAR(255) NULL
);

-- PRODUCTS
CREATE TABLE products (
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2) NULL, -- Menambahkan kolom harga diskon
  image VARCHAR(255), -- Mengubah TEXT menjadi VARCHAR(255) untuk konsistensi
  hover_image VARCHAR(255) NULL, -- Menambahkan kolom gambar hover
  stock INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MANY-TO-MANY: PRODUCTS <-> CATEGORIES
CREATE TABLE product_categories (
  product_id INT,
  category_id INT,
  PRIMARY KEY (product_id, category_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- CARTS
CREATE TABLE carts (
  cart_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE, -- Setiap user hanya punya 1 keranjang
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- CART ITEMS
CREATE TABLE cart_items (
  cart_id INT,
  product_id INT,
  quantity INT,
  PRIMARY KEY (cart_id, product_id),
  FOREIGN KEY (cart_id) REFERENCES carts(cart_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ORDERS
CREATE TABLE orders (
  order_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  address_id INT, -- Dibuat bisa NULL jika alamat dihapus
  total_price DECIMAL(10,2),
  status ENUM('pending', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  FOREIGN KEY (address_id) REFERENCES addresses(address_id) ON DELETE SET NULL
);

-- ORDER ITEMS
CREATE TABLE order_items (
  order_item_id INT PRIMARY KEY AUTO_INCREMENT, -- Mengganti nama kolom agar konsisten
  order_id INT,
  product_id INT,
  quantity INT,
  total_price DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE SET NULL
);

-- PAYMENTS
CREATE TABLE payments (
  payment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT UNIQUE,
  method ENUM('bank_transfer', 'cc', 'paypal', 'qris'),
  status ENUM('pending', 'paid', 'failed', 'expired'),
  transaction_id VARCHAR(100),
  amount_paid DECIMAL(10,2),
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- SHIPMENT
CREATE TABLE shipment (
  shipment_id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT UNIQUE,
  courier VARCHAR(50),
  status ENUM('packing', 'shipped', 'in_transit', 'delivered'),
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- REVIEWS
CREATE TABLE reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  product_id INT,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);