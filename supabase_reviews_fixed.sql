-- Drop existing product_reviews table if it exists
DROP TABLE IF EXISTS product_reviews;

-- Create a new table for review images
CREATE TABLE review_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create enhanced product reviews table with bigint for product_id
CREATE TABLE product_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,  -- Changed to BIGINT to match products table
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    helpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for reviews and images (since one review can have multiple images)
CREATE TABLE review_images_map (
    review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
    image_id UUID REFERENCES review_images(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL,
    PRIMARY KEY (review_id, image_id)
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_product_reviews_updated_at
    BEFORE UPDATE ON product_reviews
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images_map ENABLE ROW LEVEL SECURITY;

-- Policy for creating reviews (authenticated users only)
CREATE POLICY "Users can create reviews" ON product_reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for reading reviews (anyone can read)
CREATE POLICY "Anyone can read reviews" ON product_reviews
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Policy for updating reviews (only the review author)
CREATE POLICY "Users can update their own reviews" ON product_reviews
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for deleting reviews (only the review author)
CREATE POLICY "Users can delete their own reviews" ON product_reviews
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Policies for review images
CREATE POLICY "Anyone can view images" ON review_images
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Authenticated users can upload images" ON review_images
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policies for review_images_map
CREATE POLICY "Anyone can view image mappings" ON review_images_map
    FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Authenticated users can map images" ON review_images_map
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_review_images_map_review_id ON review_images_map(review_id);

-- Create a view that combines review data with image URLs
CREATE OR REPLACE VIEW review_details AS
SELECT 
    pr.id as review_id,
    pr.product_id,
    pr.user_id,
    pr.rating,
    pr.review_text,
    pr.helpful_votes,
    pr.created_at,
    pr.updated_at,
    ARRAY_AGG(
        json_build_object(
            'image_url', ri.image_url,
            'display_order', rim.display_order
        ) ORDER BY rim.display_order
    ) FILTER (WHERE ri.id IS NOT NULL) as review_images
FROM product_reviews pr
LEFT JOIN review_images_map rim ON pr.id = rim.review_id
LEFT JOIN review_images ri ON rim.image_id = ri.id
GROUP BY pr.id;