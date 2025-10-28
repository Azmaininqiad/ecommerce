import { NextRequest, NextResponse } from 'next/server';
import { createSPAClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = createSPAClient();
    
    // Get user from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No auth header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated', details: userError }, { status: 401 });
    }

    console.log('Testing order creation for user:', user.id);

    // Test 1: Can we read from orders table?
    const { data: readTest, error: readError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    console.log('Read test result:', { data: readTest, error: readError });

    // Test 2: Can we insert a minimal order?
    const testOrder = {
      user_id: user.id,
      first_name: 'Test',
      last_name: 'User',
      email: user.email || 'test@example.com',
      phone: '+1234567890',
      country: 'US',
      address: '123 Test St',
      city: 'Test City',
      subtotal: 10.00,
      shipping_fee: 5.00,
      total_amount: 15.00
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('orders')
      .insert(testOrder)
      .select()
      .single();

    console.log('Insert test result:', { data: insertTest, error: insertError });

    // If successful, clean up the test order
    if (insertTest && !insertError) {
      await supabase.from('orders').delete().eq('id', insertTest.id);
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      tests: {
        read: {
          success: !readError,
          error: readError?.message,
          data: readTest
        },
        insert: {
          success: !insertError,
          error: insertError?.message,
          orderNumber: insertTest?.order_number
        }
      }
    });

  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Order creation test endpoint. Use POST with auth header to test.'
  });
}