import { createSPAClient } from '@/components/Common/lib/supabase/client';
import { Product, ProductImage, Category, LegacyProduct } from '@/types/product';

const supabase = createSPAClient();

// Transform database product to legacy format for backward compatibility
export const transformToLegacyProduct = (product: Product, images: ProductImage[]): LegacyProduct => {
  const thumbnails = images
    .filter(img => img.image_type === 'thumbnail')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(img => img.image_url);
  
  const previews = images
    .filter(img => img.image_type === 'preview')
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(img => img.image_url);

  return {
    id: product.id,
    title: product.title,
    reviews: product.reviews_count,
    price: product.price,
    discountedPrice: product.discounted_price || product.price,
    imgs: {
      thumbnails,
      previews
    }
  };
};

// Get all products with images
export const getAllProducts = async (): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    // Group images by product_id
    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    // Transform to legacy format
    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

// Get featured products
export const getFeaturedProducts = async (): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

// Get bestseller products
export const getBestsellerProducts = async (): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_bestseller', true)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error fetching bestseller products:', error);
    return [];
  }
};

// Get new arrival products
export const getNewArrivalProducts = async (): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_new_arrival', true)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
    return [];
  }
};

// Get single product by ID
export const getProductById = async (id: number): Promise<{ success: boolean; product?: any; error?: string }> => {
  try {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return { success: false, error: productError.message };
    }

    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });

    if (imagesError) {
      console.error('Error fetching product images:', imagesError);
      // Continue without images rather than failing completely
    }

    // Return the full product data with images
    const productWithImages = {
      ...product,
      images: images || []
    };

    return { success: true, product: productWithImages };
  } catch (error: any) {
    console.error('Error fetching product by ID:', error);
    return { success: false, error: error.message || 'Failed to fetch product' };
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Search products
export const searchProducts = async (query: string): Promise<LegacyProduct[]> => {
  try {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,brand.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products.map(p => p.id);
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .in('product_id', productIds)
      .order('sort_order', { ascending: true });

    if (imagesError) throw imagesError;

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) acc[img.product_id] = [];
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, ProductImage[]>);

    return products.map(product => 
      transformToLegacyProduct(product, imagesByProduct[product.id] || [])
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};