-- Create products table
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  reviews_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  category VARCHAR(100),
  brand VARCHAR(100),
  stock_quantity INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, out_of_stock
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_images table for multiple images
CREATE TABLE product_images (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_type VARCHAR(20) DEFAULT 'thumbnail', -- thumbnail, preview, main
  sort_order INTEGER DEFAULT 0,
  alt_text VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  parent_id BIGINT REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_reviews table
CREATE TABLE product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_bestseller ON products(is_bestseller);
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);

-- Add RLS (Row Level Security) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read products (public access)
CREATE POLICY "Allow public read access to products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Allow public read access to product_images" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to product_reviews" ON product_reviews
  FOR SELECT USING (true);

-- Allow authenticated users to create reviews
CREATE POLICY "Allow authenticated users to create reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own reviews
CREATE POLICY "Allow users to update own reviews" ON product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Computers', 'computers', 'Laptops, desktops, and computer accessories'),
('Mobile Phones', 'mobile-phones', 'Smartphones and mobile accessories'),
('Gaming', 'gaming', 'Gaming consoles, controllers, and accessories'),
('Audio', 'audio', 'Headphones, speakers, and audio equipment'),
('Accessories', 'accessories', 'Various tech accessories');

-- Insert sample products (based on your current static data)
INSERT INTO products (title, description, price, discounted_price, reviews_count, rating, category, brand, stock_quantity, is_featured, is_bestseller, is_new_arrival) VALUES
('Havit HV-G69 USB Gamepad', 'High-quality USB gamepad for gaming enthusiasts', 59.00, 29.00, 15, 4.5, 'Gaming', 'Havit', 50, true, true, false),
('iPhone 14 Plus, 6/128GB', 'Latest iPhone with advanced features and great camera', 899.00, 99.00, 5, 4.8, 'Mobile Phones', 'Apple', 25, true, false, true),
('Apple iMac M1 24-inch 2021', 'Powerful all-in-one computer with M1 chip', 1299.00, 29.00, 5, 4.7, 'Computers', 'Apple', 15, false, true, false),
('MacBook Air M1 chip, 8/256GB', 'Lightweight laptop with incredible performance', 999.00, 29.00, 6, 4.9, 'Computers', 'Apple', 20, true, true, false),
('Apple Watch Ultra', 'Advanced smartwatch for fitness and productivity', 799.00, 29.00, 3, 4.6, 'Accessories', 'Apple', 30, false, false, true),
('Logitech MX Master 3 Mouse', 'Professional wireless mouse for productivity', 99.00, 29.00, 15, 4.4, 'Accessories', 'Logitech', 100, false, true, false),
('Apple iPad Air 5th Gen - 64GB', 'Versatile tablet for work and entertainment', 599.00, 29.00, 15, 4.5, 'Electronics', 'Apple', 40, false, false, true),
('Asus RT Dual Band Router', 'High-speed wireless router for home and office', 129.00, 29.00, 15, 4.3, 'Electronics', 'Asus', 60, false, true, false);

-- Insert sample product images
INSERT INTO product_images (product_id, image_url, image_type, sort_order, alt_text) VALUES
-- Havit Gamepad
(1, '/images/products/product-1-sm-1.png', 'thumbnail', 1, 'Havit HV-G69 USB Gamepad thumbnail 1'),
(1, '/images/products/product-1-sm-2.png', 'thumbnail', 2, 'Havit HV-G69 USB Gamepad thumbnail 2'),
(1, '/images/products/product-1-bg-1.png', 'preview', 1, 'Havit HV-G69 USB Gamepad preview 1'),
(1, '/images/products/product-1-bg-2.png', 'preview', 2, 'Havit HV-G69 USB Gamepad preview 2'),

-- iPhone 14 Plus
(2, '/images/products/product-2-sm-1.png', 'thumbnail', 1, 'iPhone 14 Plus thumbnail 1'),
(2, '/images/products/product-2-sm-2.png', 'thumbnail', 2, 'iPhone 14 Plus thumbnail 2'),
(2, '/images/products/product-2-bg-1.png', 'preview', 1, 'iPhone 14 Plus preview 1'),
(2, '/images/products/product-2-bg-2.png', 'preview', 2, 'iPhone 14 Plus preview 2'),

-- Apple iMac
(3, '/images/products/product-3-sm-1.png', 'thumbnail', 1, 'Apple iMac M1 thumbnail 1'),
(3, '/images/products/product-3-sm-2.png', 'thumbnail', 2, 'Apple iMac M1 thumbnail 2'),
(3, '/images/products/product-3-bg-1.png', 'preview', 1, 'Apple iMac M1 preview 1'),
(3, '/images/products/product-3-bg-2.png', 'preview', 2, 'Apple iMac M1 preview 2'),

-- MacBook Air
(4, '/images/products/product-4-sm-1.png', 'thumbnail', 1, 'MacBook Air M1 thumbnail 1'),
(4, '/images/products/product-4-sm-2.png', 'thumbnail', 2, 'MacBook Air M1 thumbnail 2'),
(4, '/images/products/product-4-bg-1.png', 'preview', 1, 'MacBook Air M1 preview 1'),
(4, '/images/products/product-4-bg-2.png', 'preview', 2, 'MacBook Air M1 preview 2'),

-- Apple Watch Ultra
(5, '/images/products/product-5-sm-1.png', 'thumbnail', 1, 'Apple Watch Ultra thumbnail 1'),
(5, '/images/products/product-5-sm-2.png', 'thumbnail', 2, 'Apple Watch Ultra thumbnail 2'),
(5, '/images/products/product-5-bg-1.png', 'preview', 1, 'Apple Watch Ultra preview 1'),
(5, '/images/products/product-5-bg-2.png', 'preview', 2, 'Apple Watch Ultra preview 2'),

-- Logitech Mouse
(6, '/images/products/product-6-sm-1.png', 'thumbnail', 1, 'Logitech MX Master 3 thumbnail 1'),
(6, '/images/products/product-6-sm-2.png', 'thumbnail', 2, 'Logitech MX Master 3 thumbnail 2'),
(6, '/images/products/product-6-bg-1.png', 'preview', 1, 'Logitech MX Master 3 preview 1'),
(6, '/images/products/product-6-bg-2.png', 'preview', 2, 'Logitech MX Master 3 preview 2'),

-- iPad Air
(7, '/images/products/product-7-sm-1.png', 'thumbnail', 1, 'Apple iPad Air thumbnail 1'),
(7, '/images/products/product-7-sm-2.png', 'thumbnail', 2, 'Apple iPad Air thumbnail 2'),
(7, '/images/products/product-7-bg-1.png', 'preview', 1, 'Apple iPad Air preview 1'),
(7, '/images/products/product-7-bg-2.png', 'preview', 2, 'Apple iPad Air preview 2'),

-- Asus Router
(8, '/images/products/product-8-sm-1.png', 'thumbnail', 1, 'Asus RT Router thumbnail 1'),
(8, '/images/products/product-8-sm-2.png', 'thumbnail', 2, 'Asus RT Router thumbnail 2'),
(8, '/images/products/product-8-bg-1.png', 'preview', 1, 'Asus RT Router preview 1'),
(8, '/images/products/product-8-bg-2.png', 'preview', 2, 'Asus RT Router preview 2');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();