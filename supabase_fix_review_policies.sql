-- Drop existing policies
DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON product_reviews;

-- Recreate policies with correct auth checks
CREATE POLICY "Users can create reviews"
ON product_reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read reviews"
ON product_reviews FOR SELECT
TO public
USING (true);

CREATE POLICY "Users can update their own reviews"
ON product_reviews FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON product_reviews FOR DELETE
TO authenticated
USING (auth.uid() = user_id);