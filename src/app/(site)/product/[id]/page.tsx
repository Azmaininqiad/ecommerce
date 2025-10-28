'use client';
import React from 'react';
import { useParams } from 'next/navigation';
import ShopDetails from '@/components/ShopDetails';

export default function ProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return <ShopDetails productId={productId} />;
}