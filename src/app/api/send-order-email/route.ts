import { NextRequest, NextResponse } from 'next/server';

// This is a simple email notification system
// In production, you would use services like:
// - Resend (resend.com)
// - SendGrid
// - Nodemailer with SMTP
// - AWS SES

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      order_id,
      order_number,
      customer_email,
      customer_name,
      total_amount,
      created_at
    } = body;

    // For now, we'll just log the order details
    // In production, replace this with actual email sending
    console.log('🎉 NEW ORDER RECEIVED!');
    console.log('========================');
    console.log(`Order ID: ${order_id}`);
    console.log(`Order Number: ${order_number}`);
    console.log(`Customer: ${customer_name}`);
    console.log(`Email: ${customer_email}`);
    console.log(`Total: $${total_amount}`);
    console.log(`Date: ${new Date(created_at).toLocaleString()}`);
    console.log('========================');

    // Here's how you would implement actual email sending:
    /*
    // Example with Resend
    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'orders@yourstore.com',
      to: ['admin@yourstore.com'], // Your admin email
      subject: `New Order: ${order_number}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Order Number:</strong> ${order_number}</p>
        <p><strong>Customer:</strong> ${customer_name}</p>
        <p><strong>Email:</strong> ${customer_email}</p>
        <p><strong>Total Amount:</strong> $${total_amount}</p>
        <p><strong>Order Date:</strong> ${new Date(created_at).toLocaleString()}</p>
        <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${order_id}">View Order Details</a></p>
      `
    });

    // Also send confirmation email to customer
    await resend.emails.send({
      from: 'orders@yourstore.com',
      to: [customer_email],
      subject: `Order Confirmation: ${order_number}`,
      html: `
        <h2>Thank you for your order!</h2>
        <p>Hi ${customer_name},</p>
        <p>We've received your order and are processing it now.</p>
        <p><strong>Order Number:</strong> ${order_number}</p>
        <p><strong>Total Amount:</strong> $${total_amount}</p>
        <p>You'll receive another email when your order ships.</p>
        <p>Thank you for shopping with us!</p>
      `
    });
    */

    return NextResponse.json({
      success: true,
      message: 'Order notification processed'
    });

  } catch (error: any) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Order email notification endpoint is working',
    instructions: 'Use POST to send order notifications'
  });
}