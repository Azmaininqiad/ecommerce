'use client';
import React, { useEffect, useState } from 'react';
import { getAllProducts } from '@/lib/supabase/products';
import Link from 'next/link';

export default function DebugProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Debug: Products from Database</h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found in database.</p>
            <p className="text-sm text-gray-500">
              Run the sample_products.sql file in your Supabase SQL editor to add sample data.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
                <p className="text-gray-600 mb-2">ID: {product.id}</p>
                <p className="text-green-600 font-medium mb-4">${product.discountedPrice}</p>
                
                <div className="space-y-2">
                  <Link 
                    href={`/product/${product.id}`}
                    className="block w-full text-center bg-blue text-white py-2 px-4 rounded hover:bg-blue-dark transition-colors"
                  >
                    View Product Details
                  </Link>
                  
                  <p className="text-xs text-gray-500">
                    Images: {product.imgs?.previews?.length || 0} previews, {product.imgs?.thumbnails?.length || 0} thumbnails
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Testing Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Run the <code className="bg-gray-200 px-2 py-1 rounded">sample_products.sql</code> file in your Supabase SQL editor</li>
            <li>Refresh this page to see the products</li>
            <li>Click View Product Details to test the dynamic product pages</li>
            <li>Each product should show its specific details, not the hardcoded gamepad info</li>
          </ol>
        </div>
      </div>
    </div>
  );
}