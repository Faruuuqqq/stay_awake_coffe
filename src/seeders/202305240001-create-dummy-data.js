const { User, Address, Category, Product, ProductCategory, Cart, CartItem, Order, OrderItem, Payment, Shipment, Review } = require('../models');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Seeding Users
    const users = await User.bulkCreate([
      { name: 'Alice Johnson', email: 'alice@example.com', password: 'passwordhash1', role: 'user' },
      { name: 'Bob Smith', email: 'bob@example.com', password: 'passwordhash2', role: 'user' },
      { name: 'Charlie Admin', email: 'charlie.admin@example.com', password: 'passwordhash3', role: 'admin' },
      { name: 'Diana Fox', email: 'diana.fox@example.com', password: 'passwordhash4', role: 'user' },
      { name: 'Evan White', email: 'evan.white@example.com', password: 'passwordhash5', role: 'user' },
      { name: 'Fiona Green', email: 'fiona.green@example.com', password: 'passwordhash6', role: 'admin' },
      { name: 'George Black', email: 'george.black@example.com', password: 'passwordhash7', role: 'user' },
      { name: 'Hannah Gray', email: 'hannah.gray@example.com', password: 'passwordhash8', role: 'user' },
      { name: 'Irene Gold', email: 'irene.gold@example.com', password: 'passwordhash9', role: 'user' },
      { name: 'John Blue', email: 'john.blue@example.com', password: 'passwordhash10', role: 'admin' }
    ]);

    // Seeding Addresses
    const addresses = await Address.bulkCreate([
      { user_id: 1, phone: '081234567890', address: 'Jl. Merdeka No. 10', city: 'Jakarta', postal_code: '10110' },
      { user_id: 1, phone: '081234567891', address: 'Jl. Sudirman No. 5', city: 'Jakarta', postal_code: '10220' },
      { user_id: 2, phone: '082345678901', address: 'Jl. Diponegoro No. 12', city: 'Bandung', postal_code: '40115' },
      { user_id: 3, phone: '083456789012', address: 'Jl. Pahlawan No. 9', city: 'Surabaya', postal_code: '60213' },
      { user_id: 4, phone: '084567890123', address: 'Jl. Garuda No. 8', city: 'Medan', postal_code: '20115' },
      { user_id: 5, phone: '085678901234', address: 'Jl. Raya No. 7', city: 'Denpasar', postal_code: '80115' },
      { user_id: 6, phone: '086789012345', address: 'Jl. Cendana No. 6', city: 'Yogyakarta', postal_code: '55115' },
      { user_id: 7, phone: '087890123456', address: 'Jl. Kuning No. 4', city: 'Malang', postal_code: '65112' },
      { user_id: 8, phone: '088901234567', address: 'Jl. Merapi No. 3', city: 'Solo', postal_code: '57115' },
      { user_id: 9, phone: '089012345678', address: 'Jl. Taman No. 11', city: 'Semarang', postal_code: '50115' }
    ]);

    // Seeding Categories
    const categories = await Category.bulkCreate([
      { name: 'Coffee' },
      { name: 'Tea' },
      { name: 'Merchandise' },
      { name: 'Accessories' },
      { name: 'Beverages' },
      { name: 'Kitchen Appliances' }
    ]);

    // Seeding Products
    const products = await Product.bulkCreate([
      { name: 'Arabica Coffee Beans', description: 'Premium Arabica coffee beans, 500g.', price: 150000.00, image: 'arabica.jpg', stock: 50 },
      { name: 'Green Tea Loose Leaf', description: 'Organic green tea from Japan, 200g.', price: 80000.00, image: 'greentea.jpg', stock: 100 },
      { name: 'Stay Awake Mug', description: 'Ceramic coffee mug with logo.', price: 75000.00, image: 'mug.jpg', stock: 150 },
      { name: 'Coffee Grinder', description: 'Manual hand grinder for coffee.', price: 300000.00, image: 'grinder.jpg', stock: 30 },
      { name: 'Espresso Machine', description: 'High-end espresso machine for home use.', price: 3500000.00, image: 'espresso_machine.jpg', stock: 10 },
      { name: 'Tea Pot', description: 'Glass tea pot with infuser, 1L.', price: 200000.00, image: 'teapot.jpg', stock: 50 },
      { name: 'Coffee Beans Storage Jar', description: 'Airtight jar for coffee storage.', price: 150000.00, image: 'storage_jar.jpg', stock: 200 },
      { name: 'Electric Kettle', description: 'Fast boiling electric kettle, 1.7L.', price: 250000.00, image: 'electric_kettle.jpg', stock: 80 },
      { name: 'Tea Infuser', description: 'Stainless steel tea infuser for loose leaf tea.', price: 30000.00, image: 'infuser.jpg', stock: 300 },
      { name: 'Coffee Cups Set', description: 'Set of 4 ceramic coffee cups.', price: 120000.00, image: 'coffee_cups.jpg', stock: 70 }
    ]);

    // Many-to-Many Products ↔ Categories
    await ProductCategory.bulkCreate([
      { product_id: 1, category_id: 1 },
      { product_id: 2, category_id: 2 },
      { product_id: 3, category_id: 3 },
      { product_id: 4, category_id: 4 },
      { product_id: 5, category_id: 6 },
      { product_id: 6, category_id: 2 },
      { product_id: 7, category_id: 3 },
      { product_id: 8, category_id: 4 },
      { product_id: 9, category_id: 5 },
      { product_id: 10, category_id: 4 }
    ]);

    // Seeding Carts
    const carts = await Cart.bulkCreate([
      { user_id: 1 },
      { user_id: 2 },
      { user_id: 3 },
      { user_id: 4 },
      { user_id: 5 }
    ]);

    // Seeding Cart Items
    await CartItem.bulkCreate([
      { cart_id: 1, product_id: 1, quantity: 2 },
      { cart_id: 1, product_id: 3, quantity: 1 },
      { cart_id: 2, product_id: 2, quantity: 3 },
      { cart_id: 3, product_id: 4, quantity: 2 },
      { cart_id: 4, product_id: 5, quantity: 1 }
    ]);

    // Seeding Orders
    const orders = await Order.bulkCreate([
      { user_id: 1, address_id: 1, total_price: 375000.00, status: 'pending' },
      { user_id: 2, address_id: 3, total_price: 240000.00, status: 'completed' }
    ]);

    // Seeding Order Items
    await OrderItem.bulkCreate([
      { order_id: 1, product_id: 1, quantity: 2, total_price: 300000.00 },
      { order_id: 1, product_id: 3, quantity: 1, total_price: 75000.00 },
      { order_id: 2, product_id: 2, quantity: 3, total_price: 240000.00 }
    ]);

    // Seeding Payments
    const payments = await Payment.bulkCreate([
      { order_id: 1, method: 'bank_transfer', status: 'pending', transaction_id: null, amount_paid: 0.00, paid_at: null },
      { order_id: 2, method: 'cc', status: 'paid', transaction_id: 'TXN123456789', amount_paid: 240000.00, paid_at: '2025-05-20 10:00:00' }
    ]);

    // Seeding Shipments
    await Shipment.bulkCreate([
      { order_id: 1, courier: 'JNE', status: 'packing', shipped_at: null, delivered_at: null },
      { order_id: 2, courier: 'SiCepat', status: 'delivered', shipped_at: '2025-05-21 14:00:00', delivered_at: '2025-05-23 10:00:00' }
    ]);

    // Seeding Reviews
    await Review.bulkCreate([
      { user_id: 1, product_id: 1, rating: 5, comment: 'Coffee beans are fresh and aromatic.' },
      { user_id: 2, product_id: 2, rating: 4, comment: 'Nice tea, good flavor but packaging could be better.' },
      { user_id: 1, product_id: 3, rating: 5, comment: 'Mug quality is excellent and design is cool.' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('addresses', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('product_categories', null, {});
    await queryInterface.bulkDelete('carts', null, {});
    await queryInterface.bulkDelete('cart_items', null, {});
    await queryInterface.bulkDelete('orders', null, {});
    await queryInterface.bulkDelete('order_items', null, {});
    await queryInterface.bulkDelete('payments', null, {});
    await queryInterface.bulkDelete('shipment', null, {});
    await queryInterface.bulkDelete('reviews', null, {});
  }
};

// to run this file
// use this command
// npx sequelize-cli db:seed:all
