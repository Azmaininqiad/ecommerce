"use client";

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { supabase } from '@/lib/supabase/client';

export function useProductDetails(productId: string | number) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        // Fetch product and its images
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            product_images (
              id,
              image_url,
              image_type,
              sort_order,
              alt_text
            )
          `)
          .eq('id', productId)
          .single();

        if (error) throw error;

        if (data) {
          // Transform the data to match the Product type if needed
          const productData: Product = {
            ...data,
            reviews_count: data.reviews_count || 0,
            rating: data.rating || 0,
            stock_quantity: data.stock_quantity || 0,
            is_featured: data.is_featured || false,
            is_bestseller: data.is_bestseller || false,
            is_new_arrival: data.is_new_arrival || false,
            status: data.status || 'active',
            // Add default imgs structure if needed
            imgs: {
              thumbnails: data.product_images
                ?.filter(img => img.image_type === 'thumbnail')
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(img => img.image_url) || [],
              previews: data.product_images
                ?.filter(img => img.image_type === 'preview')
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(img => img.image_url) || []
            }
          };
          setProduct(productData);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch product'));
      } finally {
        setLoading(false);
      }
    }

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  return { product, loading, error };
}