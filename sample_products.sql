-- Sample products for testing dynamic product pages
-- Run this in your Supabase SQL editor

-- Insert sample products
INSERT INTO products (title, description, price, discounted_price, category, brand, stock_quantity, rating, reviews_count, is_featured, is_bestseller, is_new_arrival, status) VALUES
('iMac M1 24-inch', 'Apple iMac with M1 chip, 24-inch 4.5K Retina display, 8GB RAM, 256GB SSD. Perfect for creative professionals and everyday computing.', 1299.00, 1199.00, 'Computers', 'Apple', 15, 4.8, 127, true, true, true, 'active'),
('HyperX Cloud II Gaming Headset', 'Professional gaming headset with 7.1 virtual surround sound, memory foam ear cushions, and detachable microphone.', 99.99, 79.99, 'Gaming', 'HyperX', 45, 4.6, 89, true, false, true, 'active'),
('Sony WH-1000XM4 Headphones', 'Industry-leading noise canceling wireless headphones with 30-hour battery life and premium sound quality.', 349.99, 299.99, 'Audio', 'Sony', 23, 4.9, 156, true, true, false, 'active'),
('MacBook Pro 14-inch M2', 'Apple MacBook Pro with M2 Pro chip, 14-inch Liquid Retina XDR display, 16GB RAM, 512GB SSD. Built for professionals.', 2499.00, 2299.00, 'Computers', 'Apple', 8, 4.9, 203, true, true, true, 'active'),
('Logitech MX Master 3S Mouse', 'Advanced wireless mouse with ultra-fast scrolling, customizable buttons, and multi-device connectivity.', 99.99, 89.99, 'Accessories', 'Logitech', 67, 4.7, 94, false, true, false, 'active'),
('iPad Air 5th Generation', 'Apple iPad Air with M1 chip, 10.9-inch Liquid Retina display, 64GB storage. Perfect for creativity and productivity.', 599.00, 549.00, 'Tablets', 'Apple', 32, 4.8, 178, true, false, true, 'active'),
('Samsung Galaxy S23 Ultra', 'Premium Android smartphone with 200MP camera, S Pen, 256GB storage, and 6.8-inch Dynamic AMOLED display.', 1199.99, 1099.99, 'Smartphones', 'Samsung', 19, 4.7, 145, true, true, false, 'active'),
('Dell XPS 13 Laptop', 'Ultra-portable laptop with 13.4-inch InfinityEdge display, Intel Core i7, 16GB RAM, 512GB SSD.', 1399.99, 1299.99, 'Computers', 'Dell', 12, 4.6, 87, false, false, true, 'active');

-- Insert sample product images (using existing placeholder images)
-- iMac M1 (product_id: 1)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(1, '/images/products/product-1-bg-1.png', 'preview', 1),
(1, '/images/products/product-1-bg-2.png', 'preview', 2),
(1, '/images/products/product-1-bg-3.png', 'preview', 3),
(1, '/images/products/product-1-sm-1.png', 'thumbnail', 1),
(1, '/images/products/product-1-sm-2.png', 'thumbnail', 2),
(1, '/images/products/product-1-sm-3.png', 'thumbnail', 3);

-- HyperX Gaming Headset (product_id: 2)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(2, '/images/products/product-2-bg-1.png', 'preview', 1),
(2, '/images/products/product-2-bg-2.png', 'preview', 2),
(2, '/images/products/product-2-sm-1.png', 'thumbnail', 1),
(2, '/images/products/product-2-sm-2.png', 'thumbnail', 2);

-- Sony Headphones (product_id: 3)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(3, '/images/products/product-3-bg-1.png', 'preview', 1),
(3, '/images/products/product-3-bg-2.png', 'preview', 2),
(3, '/images/products/product-3-sm-1.png', 'thumbnail', 1),
(3, '/images/products/product-3-sm-2.png', 'thumbnail', 2);

-- MacBook Pro (product_id: 4)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(4, '/images/products/product-4-bg-1.png', 'preview', 1),
(4, '/images/products/product-4-bg-2.png', 'preview', 2),
(4, '/images/products/product-4-bg-3.png', 'preview', 3),
(4, '/images/products/product-4-sm-1.png', 'thumbnail', 1),
(4, '/images/products/product-4-sm-2.png', 'thumbnail', 2),
(4, '/images/products/product-4-sm-3.png', 'thumbnail', 3);

-- Logitech Mouse (product_id: 5)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(5, '/images/products/product-5-bg-1.png', 'preview', 1),
(5, '/images/products/product-5-bg-2.png', 'preview', 2),
(5, '/images/products/product-5-sm-1.png', 'thumbnail', 1),
(5, '/images/products/product-5-sm-2.png', 'thumbnail', 2);

-- iPad Air (product_id: 6)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(6, '/images/products/product-6-bg-1.png', 'preview', 1),
(6, '/images/products/product-6-bg-2.png', 'preview', 2),
(6, '/images/products/product-6-sm-1.png', 'thumbnail', 1),
(6, '/images/products/product-6-sm-2.png', 'thumbnail', 2);

-- Samsung Galaxy S23 (product_id: 7)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(7, '/images/products/product-7-bg-1.png', 'preview', 1),
(7, '/images/products/product-7-bg-2.png', 'preview', 2),
(7, '/images/products/product-7-sm-1.png', 'thumbnail', 1),
(7, '/images/products/product-7-sm-2.png', 'thumbnail', 2);

-- Dell XPS 13 (product_id: 8)
INSERT INTO product_images (product_id, image_url, image_type, sort_order) VALUES
(8, '/images/products/product-8-bg-1.png', 'preview', 1),
(8, '/images/products/product-8-bg-2.png', 'preview', 2),
(8, '/images/products/product-8-sm-1.png', 'thumbnail', 1),
(8, '/images/products/product-8-sm-2.png', 'thumbnail', 2);

-- Add some categories if they don't exist
INSERT INTO categories (name, slug, description, is_active) VALUES
('Computers', 'computers', 'Desktop computers, laptops, and workstations', true),
('Gaming', 'gaming', 'Gaming accessories and peripherals', true),
('Audio', 'audio', 'Headphones, speakers, and audio equipment', true),
('Tablets', 'tablets', 'Tablets and tablet accessories', true),
('Smartphones', 'smartphones', 'Mobile phones and accessories', true),
('Accessories', 'accessories', 'Computer and tech accessories', true)
ON CONFLICT (name) DO NOTHING;