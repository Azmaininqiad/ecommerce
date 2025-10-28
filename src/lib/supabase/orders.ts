import { version } from 'os';
import { version } from 'os';
import { createSPAClient, createServerClient } from './client';

export interface OrderData {
  // Billing Information
  firstName: string;
  lastName: string;
  companyName?: string;
  email: string;
  phone: string;

  // Address Information
  country: string;
  address: string;
  addressTwo?: string;
  city: string;
  state?: string;
  postalCode?: string;

  // Shipping Information (if different)
  shipToDifferent?: boolean;
  shipCountry?: string;
  shipAddress?: string;
  shipAddressTwo?: string;
  shipCity?: string;
  shipState?: string;
  shipPostalCode?: string;

  // Order Details
  subtotal: number;
  shippingFee: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;

  // Payment Information
  paymentMethod?: string;

  // Additional Information
  notes?: string;
  couponCode?: string;
}

export interface OrderItem {
  productId: string;
  productTitle: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CreateOrderRequest {
  orderData: OrderData;
  orderItems: OrderItem[];
}

export interface Order extends OrderData {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export const createOrder = async ({ orderData, orderItems }: CreateOrderRequest): Promise<{ order: Order; success: boolean; error?: string }> => {
  try {
    const supabase = createSPAClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User authentication error:', userError);
      return { order: null as any, success: false, error: 'User not authenticated' };
    }

    console.log('Creating order for user:', user.id);
    console.log('Order data:', orderData);

    // Test user permissions and table access
    console.log('User ID:', user.id);
    console.log('User metadata:', user.user_metadata);

    // First, let's test if the orders table exists and we can access it
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('Orders table test error:', testError);
      console.error('Full error object:', JSON.stringify(testError, null, 2));

      // Check if it's an RLS policy issue
      if (testError.message?.includes('RLS') || testError.message?.includes('policy') || testError.code === 'PGRST116') {
        return { order: null as any, success: false, error: `Permission denied: Row Level Security policies may be blocking access. Please check RLS policies for the orders table.` };
      }

      return { order: null as any, success: false, error: `Database error: ${testError.message || 'Unknown database error'}. Please make sure the orders table exists and is accessible.` };
    }

    // Start a transaction by creating the order first
    const orderInsertData = {
      user_id: user.id,
      first_name: orderData.firstName,
      last_name: orderData.lastName,
      company_name: orderData.companyName || null,
      email: orderData.email,
      phone: orderData.phone,
      country: orderData.country,
      address: orderData.address,
      address_two: orderData.addressTwo || null,
      city: orderData.city,
      state: orderData.state || null,
      postal_code: orderData.postalCode || null,
      ship_to_different: orderData.shipToDifferent || false,
      ship_country: orderData.shipCountry || null,
      ship_address: orderData.shipAddress || null,
      ship_address_two: orderData.shipAddressTwo || null,
      ship_city: orderData.shipCity || null,
      ship_state: orderData.shipState || null,
      ship_postal_code: orderData.shipPostalCode || null,
      subtotal: orderData.subtotal,
      shipping_fee: orderData.shippingFee,
      tax_amount: orderData.taxAmount || 0,
      discount_amount: orderData.discountAmount || 0,
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod || 'cash',
      notes: orderData.notes || null,
      coupon_code: orderData.couponCode || null,
    };

    console.log('Inserting order with data:', orderInsertData);

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      console.error('Error details:', JSON.stringify(orderError, null, 2));
      return { order: null as any, success: false, error: orderError.message || 'Failed to create order' };
    }

    console.log('Order created successfully:', order);

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.productTitle,
      product_price: item.productPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
      return { order: null as any, success: false, error: itemsError.message };
    }

    return {
      order: {
        id: order.id,
        userId: order.user_id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        firstName: order.first_name,
        lastName: order.last_name,
        companyName: order.company_name,
        email: order.email,
        phone: order.phone,
        country: order.country,
        address: order.address,
        addressTwo: order.address_two,
        city: order.city,
        state: order.state,
        postalCode: order.postal_code,
        shipToDifferent: order.ship_to_different,
        shipCountry: order.ship_country,
        shipAddress: order.ship_address,
        shipAddressTwo: order.ship_address_two,
        shipCity: order.ship_city,
        shipState: order.ship_state,
        shipPostalCode: order.ship_postal_code,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        taxAmount: order.tax_amount,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        notes: order.notes,
        couponCode: order.coupon_code,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      },
      success: true
    };
  } catch (error: any) {
    console.error('Unexpected error creating order:', error);
    return { order: null as any, success: false, error: error.message };
  }
};

export const getUserOrders = async (): Promise<{ orders: Order[]; success: boolean; error?: string }> => {
  try {
    const supabase = createSPAClient();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_title,
          product_price,
          quantity,
          subtotal
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { orders: [], success: false, error: error.message };
    }

    const formattedOrders: Order[] = orders.map(order => ({
      id: order.id,
      userId: order.user_id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      firstName: order.first_name,
      lastName: order.last_name,
      companyName: order.company_name,
      email: order.email,
      phone: order.phone,
      country: order.country,
      address: order.address,
      addressTwo: order.address_two,
      city: order.city,
      state: order.state,
      postalCode: order.postal_code,
      shipToDifferent: order.ship_to_different,
      shipCountry: order.ship_country,
      shipAddress: order.ship_address,
      shipAddressTwo: order.ship_address_two,
      shipCity: order.ship_city,
      shipState: order.ship_state,
      shipPostalCode: order.ship_postal_code,
      subtotal: order.subtotal,
      shippingFee: order.shipping_fee,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method,
      notes: order.notes,
      couponCode: order.coupon_code,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    return { orders: formattedOrders, success: true };
  } catch (error: any) {
    return { orders: [], success: false, error: error.message };
  }
};

export const getOrderById = async (orderId: string): Promise<{ order: Order | null; success: boolean; error?: string }> => {
  try {
    const supabase = createSPAClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_title,
          product_price,
          quantity,
          subtotal
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      return { order: null, success: false, error: error.message };
    }

    const formattedOrder: Order = {
      id: order.id,
      userId: order.user_id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      firstName: order.first_name,
      lastName: order.last_name,
      companyName: order.company_name,
      email: order.email,
      phone: order.phone,
      country: order.country,
      address: order.address,
      addressTwo: order.address_two,
      city: order.city,
      state: order.state,
      postalCode: order.postal_code,
      shipToDifferent: order.ship_to_different,
      shipCountry: order.ship_country,
      shipAddress: order.ship_address,
      shipAddressTwo: order.ship_address_two,
      shipCity: order.ship_city,
      shipState: order.ship_state,
      shipPostalCode: order.ship_postal_code,
      subtotal: order.subtotal,
      shippingFee: order.shipping_fee,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      totalAmount: order.total_amount,
      paymentMethod: order.payment_method,
      notes: order.notes,
      couponCode: order.coupon_code,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return { order: formattedOrder, success: true };
  } catch (error: any) {
    return { order: null, success: false, error: error.message };
  }
};
// Server-side version for API routes (doesn't require user session)
export const createOrderServer = async ({ orderData, orderItems, userId }: CreateOrderRequest & { userId: string }): Promise<{ order: Order; success: boolean; error?: string }> => {
  try {
    const supabase = createServerClient();

    // Start a transaction by creating the order first
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        first_name: orderData.firstName,
        last_name: orderData.lastName,
        company_name: orderData.companyName,
        email: orderData.email,
        phone: orderData.phone,
        country: orderData.country,
        address: orderData.address,
        address_two: orderData.addressTwo,
        city: orderData.city,
        state: orderData.state,
        postal_code: orderData.postalCode,
        ship_to_different: orderData.shipToDifferent || false,
        ship_country: orderData.shipCountry,
        ship_address: orderData.shipAddress,
        ship_address_two: orderData.shipAddressTwo,
        ship_city: orderData.shipCity,
        ship_state: orderData.shipState,
        ship_postal_code: orderData.shipPostalCode,
        subtotal: orderData.subtotal,
        shipping_fee: orderData.shippingFee,
        tax_amount: orderData.taxAmount || 0,
        discount_amount: orderData.discountAmount || 0,
        total_amount: orderData.totalAmount,
        payment_method: orderData.paymentMethod,
        notes: orderData.notes,
        coupon_code: orderData.couponCode,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return { order: null as any, success: false, error: orderError.message };
    }

    // Create order items
    const orderItemsData = orderItems.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.productTitle,
      product_price: item.productPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      // Try to delete the order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
      return { order: null as any, success: false, error: itemsError.message };
    }

    return {
      order: {
        id: order.id,
        userId: order.user_id,
        orderNumber: order.order_number,
        status: order.status,
        paymentStatus: order.payment_status,
        firstName: order.first_name,
        lastName: order.last_name,
        companyName: order.company_name,
        email: order.email,
        phone: order.phone,
        country: order.country,
        address: order.address,
        addressTwo: order.address_two,
        city: order.city,
        state: order.state,
        postalCode: order.postal_code,
        shipToDifferent: order.ship_to_different,
        shipCountry: order.ship_country,
        shipAddress: order.ship_address,
        shipAddressTwo: order.ship_address_two,
        shipCity: order.ship_city,
        shipState: order.ship_state,
        shipPostalCode: order.ship_postal_code,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        taxAmount: order.tax_amount,
        discountAmount: order.discount_amount,
        totalAmount: order.total_amount,
        paymentMethod: order.payment_method,
        notes: order.notes,
        couponCode: order.coupon_code,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      },
      success: true
    };
  } catch (error: any) {
    console.error('Unexpected error creating order:', error);
    return { order: null as any, success: false, error: error.message };
  }
};