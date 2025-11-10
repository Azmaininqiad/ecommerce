-- Create a new storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true);

-- Set up storage policies for the review-images bucket
CREATE POLICY "Anyone can view review images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'review-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own review images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'review-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own review images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'review-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
);