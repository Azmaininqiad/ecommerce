'use client';
import { useState, useEffect } from 'react';
import { LegacyProduct, Category } from '@/types/product';
import {
  getAllProducts,
  getFeaturedProducts,
  getBestsellerProducts,
  getNewArrivalProducts,
  getProductById,
  getProductsByCategory,
  getAllCategories,
  searchProducts
} from '@/lib/supabase/products';

// Hook for all products
export const useProducts = () => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error, refetch: () => fetchProducts() };
};

// Hook for featured products
export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook for bestseller products
export const useBestsellerProducts = () => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getBestsellerProducts();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bestseller products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook for new arrival products
export const useNewArrivalProducts = () => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getNewArrivalProducts();
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch new arrival products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};

// Hook for single product
export const useProduct = (id: number) => {
  const [product, setProduct] = useState<LegacyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await getProductById(id);
        setProduct(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return { product, loading, error };
};

// Hook for products by category
export const useProductsByCategory = (category: string) => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getProductsByCategory(category);
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products by category');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchProducts();
    }
  }, [category]);

  return { products, loading, error };
};

// Hook for categories
export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        setCategories(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Hook for product search
export const useProductSearch = (query: string) => {
  const [products, setProducts] = useState<LegacyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!query.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);
        const data = await searchProducts(query);
        setProducts(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to search products');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { products, loading, error };
};