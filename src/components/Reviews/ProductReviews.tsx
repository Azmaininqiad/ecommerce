'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ReviewImage {
  image_url: string;
  display_order: number;
}

interface Review {
  review_id: string;
  product_id: string;
  user_id: string;
  rating: number;
  review_text: string;
  helpful_votes: number;
  created_at: string;
  review_images: ReviewImage[];
  user_details?: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

interface ProductReviewsProps {
  productId: number;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    review_text: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('review_details')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      const reviewsWithUserDetails = await Promise.all(
        reviewsData.map(async (review) => {
          const { data: userData } = await supabase
            .from('users')
            .select('email, user_metadata')
            .eq('id', review.user_id)
            .single();

          return {
            ...review,
            user_details: userData,
          };
        })
      );

      setReviews(reviewsWithUserDetails);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
        
        if (!isValidType) {
          setError('Please upload only image files');
          return false;
        }
        if (!isValidSize) {
          setError('Image size should be less than 5MB');
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setSelectedImages((prev) => [...prev, ...validFiles]);
        const newPreviewUrls = validFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
        setError(''); // Clear any previous errors
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/signin');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const uploadedImageUrls = [];
      for (const image of selectedImages) {
        // Replace spaces with underscores in filename
        const safeFileName = image.name.replace(/\s+/g, '_');
        const filePath = `${user.id}/${Date.now()}-${safeFileName}`;
        const { error: uploadError, data } = await supabase.storage
          .from('review-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('review-images')
          .getPublicUrl(filePath);

        uploadedImageUrls.push(publicUrl);
      }

      // Get the current user's session to ensure we have the right ID
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const { data: reviewData, error: reviewError } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: currentUser.id,  // Use the ID from the current session
          rating: newReview.rating,
          review_text: newReview.review_text,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      if (uploadedImageUrls.length > 0) {
        const imageEntries = uploadedImageUrls.map((url) => ({
          image_url: url,
        }));

        const { data: imageData, error: imageError } = await supabase
          .from('review_images')
          .insert(imageEntries)
          .select();

        if (imageError) throw imageError;

        const imageMappings = imageData.map((img, index) => ({
          review_id: reviewData.id,
          image_id: img.id,
          display_order: index + 1,
        }));

        const { error: mappingError } = await supabase
          .from('review_images_map')
          .insert(imageMappings);

        if (mappingError) throw mappingError;
      }

      setNewReview({ rating: 5, review_text: '' });
      setSelectedImages([]);
      setPreviewUrls([]);
      fetchReviews();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (!user) {
      router.push('/signin');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_reviews')
        .update({ helpful_votes: reviews.find(r => r.review_id === reviewId)?.helpful_votes! + 1 })
        .eq('id', reviewId);

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error('Error updating helpful votes:', error);
    }
  };

  return (
    <div className="space-y-8">
      {user ? (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={star <= newReview.rating ? "text-yellow-400" : "text-gray-300"}
                  >
                    {star <= newReview.rating ? (
                      <StarIcon className="h-6 w-6" />
                    ) : (
                      <StarOutlineIcon className="h-6 w-6" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                value={newReview.review_text}
                onChange={(e) =>
                  setNewReview({ ...newReview, review_text: e.target.value })
                }
                rows={4}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue focus:border-blue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Images (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue file:text-white hover:file:bg-blue-dark"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative w-[100px] h-[100px]">
                    {url && (
                      <>
                        <Image
                          src={url}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 z-10"
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <p className="text-center text-gray-600">
            <Link href="/signin" className="text-blue hover:underline">
              Sign in
            </Link>{' '}
            to write a review
          </p>
        </div>
      )}

      {/* Reviews List - Visible to all users */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.review_id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {review.user_details?.user_metadata?.full_name ||
                      review.user_details?.email ||
                      'Anonymous'}
                  </span>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleHelpfulVote(review.review_id)}
                className="text-sm text-gray-500 hover:text-blue flex items-center gap-1"
              >
                <span>Helpful ({review.helpful_votes})</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-4">{review.review_text}</p>

            {review.review_images?.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {review.review_images
                  .filter(img => img.image_url)
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((image, index) => (
                    <div key={index} className="relative min-w-[100px] h-[100px] flex-shrink-0">
                      <Image
                        src={image.image_url}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="100px"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <p className="text-center text-gray-500">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;