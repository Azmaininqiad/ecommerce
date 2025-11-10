"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { createOrder, OrderData, OrderItem } from "@/lib/supabase/orders";

const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const shippingFee = 15.00;
  const finalTotal = totalPrice + shippingFee;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const formData = new FormData(e.currentTarget);
      
      // Prepare the order data
      const orderData: OrderData = {
        // Billing Information
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        companyName: formData.get('companyName') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        
        // Address Information
        country: formData.get('country') as string,
        address: formData.get('address') as string,
        addressTwo: formData.get('addressTwo') as string,
        city: formData.get('town') as string,
        state: formData.get('state') as string,
        
        // Order Details
        subtotal: totalPrice,
        shippingFee: shippingFee,
        totalAmount: finalTotal,
        
        // Payment Information
        paymentMethod: formData.get('paymentMethod') as string || 'cash',
        
        // Additional Information
        notes: formData.get('notes') as string,
        couponCode: formData.get('coupon') as string,
      };

      // Prepare order items
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.id.toString(),
        productTitle: item.title,
        productPrice: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      // Create order directly using client-side function
      const result = await createOrder({ orderData, orderItems });

      if (result.success) {
        setSubmitMessage(`Order created successfully! Order number: ${result.order.orderNumber}`);
        
        // Send email notification
        try {
          await fetch('/api/send-order-email', {
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
        }
        
        // Redirect to order confirmation page after a short delay
        setTimeout(() => {
          window.location.href = `/order-confirmation/${result.order.id}`;
        }, 2000);
      } else {
        let errorMessage = result.error || 'Unknown error occurred';
        
        // Check if it's a database table issue
        if (errorMessage.includes('relation "public.orders" does not exist') || 
            errorMessage.includes('Database error')) {
          errorMessage = `Database not ready: The orders table doesn't exist yet. Please run the SQL migration first. Visit /debug-db to check database status.`;
        }
        
        setSubmitMessage(`Error: ${errorMessage}`);
      }
    } catch (error: any) {
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleSubmit}>
            {submitMessage && (
              <div className={`mb-6 p-4 rounded-md ${
                submitMessage.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {submitMessage}
              </div>
            )}
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* <!-- checkout left --> */}
              <div className="lg:max-w-[670px] w-full">
                {/* <!-- login box --> */}
                <Login />

                {/* <!-- billing details --> */}
                <Billing />

                {/* <!-- address box two --> */}
                <Shipping />

                {/* <!-- others note box --> */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <div>
                    <label htmlFor="notes" className="block mb-2.5">
                      Other Notes (optional)
                    </label>

                    <textarea
                      name="notes"
                      id="notes"
                      rows={5}
                      placeholder="Notes about your order, e.g. speacial notes for delivery."
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* // <!-- checkout right --> */}
              <div className="max-w-[455px] w-full">
                {/* <!-- order list box --> */}
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">
                      Your Order
                    </h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* <!-- title --> */}
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <div>
                        <h4 className="font-medium text-dark">Product</h4>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark text-right">
                          Subtotal
                        </h4>
                      </div>
                    </div>

                    {/* <!-- cart items --> */}
                    {cartItems.length > 0 ? (
                      cartItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between py-5 border-b border-gray-3">
                          <div>
                            <p className="text-dark">
                              {item.title} {item.quantity > 1 && `× ${item.quantity}`}
                            </p>
                          </div>
                          <div>
                            <p className="text-dark text-right">
                              {(item.price * item.quantity).toFixed(2)} BDT
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-10 border-b border-gray-3">
                        <p className="text-gray-500">Your cart is empty</p>
                      </div>
                    )}

                    {/* <!-- subtotal --> */}
                    {cartItems.length > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Subtotal</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">{totalPrice.toFixed(2)} BDT</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- shipping fee --> */}
                    {cartItems.length > 0 && (
                      <div className="flex items-center justify-between py-5 border-b border-gray-3">
                        <div>
                          <p className="text-dark">Shipping Fee</p>
                        </div>
                        <div>
                          <p className="text-dark text-right">{shippingFee.toFixed(2)}BDT</p>
                        </div>
                      </div>
                    )}

                    {/* <!-- total --> */}
                    <div className="flex items-center justify-between pt-5">
                      <div>
                        <p className="font-medium text-lg text-dark">Total</p>
                      </div>
                      <div>
                        <p className="font-medium text-lg text-dark text-right">
                          {cartItems.length > 0 ? finalTotal.toFixed(2) : '0.00'}BDT
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* <!-- coupon box --> */}
                <Coupon />

                {/* <!-- shipping box --> */}
                <ShippingMethod />

                {/* <!-- payment box --> */}
                <PaymentMethod />

                {/* <!-- checkout button --> */}
                <button
                  type="submit"
                  disabled={cartItems.length === 0 || isSubmitting}
                  className={`w-full flex justify-center font-medium py-3 px-6 rounded-md ease-out duration-200 mt-7.5 ${
                    cartItems.length === 0 || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'text-white bg-blue hover:bg-blue-dark'
                  }`}
                >
                  {isSubmitting 
                    ? 'Processing...' 
                    : cartItems.length === 0 
                      ? 'Cart is Empty' 
                      : 'Process to Checkout'
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
