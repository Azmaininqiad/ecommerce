import { NextRequest, NextResponse } from 'next/server';
import { createOrderServer, OrderData, OrderItem } from '@/lib/supabase/orders';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createServerClient();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Set the auth header for the server client
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      // Billing Information
      firstName,
      lastName,
      companyName,
      email,
      phone,
      
      // Address Information
      country,
      address,
      addressTwo,
      city,
      state,
      postalCode,
      
      // Shipping Information
      shipToDifferent,
      shipCountry,
      shipAddress,
      shipAddressTwo,
      shipCity,
      shipState,
      shipPostalCode,
      
      // Order Details
      subtotal,
      shippingFee,
      taxAmount,
      discountAmount,
      totalAmount,
      
      // Payment Information
      paymentMethod,
      
      // Additional Information
      notes,
      couponCode,
      
      // Cart Items
      cartItems
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !country || !address || !city) {
      return NextResponse.json(
        { success: false, error: 'Missing required billing information' },
        { status: 400 }
      );
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty' },
        { status: 400 }
      );
    }

    if (!subtotal || !totalAmount) {
      return NextResponse.json(
        { success: false, error: 'Missing order totals' },
        { status: 400 }
      );
    }

    // Prepare order data
    const orderData: OrderData = {
      firstName,
      lastName,
      companyName,
      email,
      phone,
      country,
      address,
      addressTwo,
      city,
      state,
      postalCode,
      shipToDifferent: shipToDifferent || false,
      shipCountry,
      shipAddress,
      shipAddressTwo,
      shipCity,
      shipState,
      shipPostalCode,
      subtotal: parseFloat(subtotal),
      shippingFee: parseFloat(shippingFee) || 0,
      taxAmount: parseFloat(taxAmount) || 0,
      discountAmount: parseFloat(discountAmount) || 0,
      totalAmount: parseFloat(totalAmount),
      paymentMethod: paymentMethod || 'cash',
      notes,
      couponCode,
    };

    // Prepare order items
    const orderItems: OrderItem[] = cartItems.map((item: any) => ({
      productId: item.id.toString(),
      productTitle: item.title,
      productPrice: parseFloat(item.price),
      quantity: parseInt(item.quantity),
      subtotal: parseFloat(item.price) * parseInt(item.quantity),
    }));

    // Create the order
    const result = await createOrderServer({ orderData, orderItems, userId: user.id });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Send email notification (fire and forget)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: result.order.id,
          order_number: result.order.orderNumber,
          customer_email: result.order.email,
          customer_name: `${result.order.firstName} ${result.order.lastName}`,
          total_amount: result.order.totalAmount,
          created_at: result.order.createdAt
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send success response
    return NextResponse.json({
      success: true,
      order: result.order,
      message: 'Order created successfully'
    });

  } catch (error: any) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Checkout API is working. Use POST to create orders.',
    timestamp: new Date().toISOString()
  });
}