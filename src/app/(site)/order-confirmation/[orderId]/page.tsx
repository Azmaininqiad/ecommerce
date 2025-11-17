'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getOrderById, Order } from '@/lib/supabase/orders';
import Breadcrumb from '@/components/Common/Breadcrumb';
import Link from 'next/link';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const result = await getOrderById(orderId);
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError(result.error || 'Order not found');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={['order-confirmation']} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading order details...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Breadcrumb title="Order Confirmation" pages={['order-confirmation']} />
        <section className="py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-red-700 mb-4">Order Not Found</h2>
                <p className="text-red-600 mb-6">{error || 'The order you are looking for does not exist.'}</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Order Confirmation" pages={['order-confirmation']} />
      <section className="py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Success Message */}
          <div className="text-center mb-10">
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-700 mb-2">Order Confirmed!</h1>
              <p className="text-green-600 mb-4">
                Thank you for your order. Weve received your order and are processing it now.
              </p>
              <p className="text-lg font-semibold text-gray-800">
                Order Number: <span className="text-blue">{order.orderNumber}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-1 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Order Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium capitalize">
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg shadow-1 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Billing Information</h2>
              
              <div className="space-y-2">
                <p className="font-semibold">{order.firstName} {order.lastName}</p>
                {order.companyName && <p className="text-gray-600">{order.companyName}</p>}
                <p className="text-gray-600">{order.email}</p>
                <p className="text-gray-600">{order.phone}</p>
                <div className="pt-2">
                  <p className="text-gray-600">{order.address}</p>
                  {order.addressTwo && <p className="text-gray-600">{order.addressTwo}</p>}
                  <p className="text-gray-600">
                    {order.city}, {order.state} {order.postalCode}
                  </p>
                  <p className="text-gray-600">{order.country}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-1 p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold">{order.subtotal.toFixed(2)}BDT</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold">{order.shippingFee.toFixed(2)}BDT</span>
              </div>
              {order.taxAmount > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-semibold">{order.taxAmount.toFixed(2)}BDT</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className="flex justify-between py-2 border-b text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-{order.discountAmount.toFixed(2)}BDT</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-t-2 border-gray-200">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-lg font-bold text-blue">{order.totalAmount.toFixed(2)}BDT</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center mt-10">
            <div className="space-x-4">
              <Link
                href="/my-account"
                className="inline-flex items-center px-6 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors"
              >
                View My Orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}