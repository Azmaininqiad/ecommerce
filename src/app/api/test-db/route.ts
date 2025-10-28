import { NextRequest, NextResponse } from 'next/server';
import { createSPAClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createSPAClient();
    
    // Test if orders table exists
    const { data: ordersTest, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    // Test if order_items table exists  
    const { data: itemsTest, error: itemsError } = await supabase
      .from('order_items')
      .select('id')
      .limit(1);

    // Test if products table exists
    const { data: productsTest, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    return NextResponse.json({
      success: true,
      tables: {
        orders: {
          exists: !ordersError,
          error: ordersError?.message,
          data: ordersTest
        },
        order_items: {
          exists: !itemsError,
          error: itemsError?.message,
          data: itemsTest
        },
        products: {
          exists: !productsError,
          error: productsError?.message,
          data: productsTest
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}