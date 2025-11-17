/**
 * Example implementation of cart component with database synchronization
 * This shows how to integrate the cart database functions into your existing components
 * 
 * NOTE: This is an example file. Uncomment the useAuth import based on your project structure.
 */

import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
// Uncomment based on your project structure:
// import { useAuth } from "../contexts/AuthContext";
// import { useAuth } from "@/contexts/AuthContext";
import {
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} from "@/redux/features/cart-slice";
import {
  removeItemFromCartDB,
  updateCartItemQuantityDB,
  clearUserCartDB,
} from "@/lib/supabase/cart";
import toast from "react-hot-toast";

interface CartComponentExampleProps {
  // Your props here
}

export const CartComponentExample: React.FC<CartComponentExampleProps> = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const dispatch = useDispatch();
  // TODO: Uncomment the useAuth import and this line based on your project structure
  const user: any = null; // const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Handle remove item with database sync
  const handleRemoveItem = async (itemId: number, dbId?: string) => {
    try {
      setIsLoading(true);

      // Remove from Redux immediately for UI feedback
      dispatch(removeItemFromCart(itemId));

      // Sync to database if user is logged in
      if (user && dbId) {
        const success = await removeItemFromCartDB(dbId);
        if (!success) {
          // Rollback if database operation fails
          toast.error("Failed to remove item from cart");
          // Note: You would need to add the item back to Redux here
        } else {
          toast.success("Item removed from cart");
        }
      } else if (!user) {
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Error removing item from cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quantity update with database sync
  const handleUpdateQuantity = async (
    itemId: number,
    newQuantity: number,
    dbId?: string
  ) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(itemId, dbId);
        return;
      }

      setIsLoading(true);

      // Update Redux
      dispatch(updateCartItemQuantity({ id: itemId, quantity: newQuantity }));

      // Sync to database if user is logged in
      if (user && dbId) {
        const result = await updateCartItemQuantityDB(dbId, newQuantity);
        if (!result) {
          toast.error("Failed to update quantity");
        }
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Error updating quantity");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle clear cart with database sync
  const handleClearCart = async () => {
    try {
      if (!window.confirm("Are you sure you want to clear your cart?")) {
        return;
      }

      setIsLoading(true);

      // Clear Redux
      dispatch(removeAllItemsFromCart());

      // Clear database if user is logged in
      if (user) {
        const success = await clearUserCartDB();
        if (!success) {
          toast.error("Failed to clear cart");
        } else {
          toast.success("Cart cleared");
        }
      } else {
        toast.success("Cart cleared");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Error clearing cart");
    } finally {
      setIsLoading(false);
    }
  };

  // Render cart items
  const renderCartItems = () => {
    return cartItems.map((item) => (
      <div key={item.id} className="cart-item">
        <div className="item-image">
          {item.imgs?.thumbnails?.[0] && (
            <img src={item.imgs.thumbnails[0]} alt={item.title} />
          )}
        </div>

        <div className="item-info">
          <h3>{item.title}</h3>
          <p className="price">
            {item.discountedPrice.toFixed(2)}BDT
          </p>
        </div>

        <div className="quantity-control">
          <button
            onClick={() =>
              handleUpdateQuantity(item.id, item.quantity - 1, item.dbId)
            }
            disabled={isLoading}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(e) =>
              handleUpdateQuantity(item.id, parseInt(e.target.value), item.dbId)
            }
            disabled={isLoading}
          />
          <button
            onClick={() =>
              handleUpdateQuantity(item.id, item.quantity + 1, item.dbId)
            }
            disabled={isLoading}
          >
            +
          </button>
        </div>

        <div className="subtotal">
          {(item.discountedPrice * item.quantity).toFixed(2)}BDT
        </div>

        <button
          onClick={() => handleRemoveItem(item.id, item.dbId)}
          disabled={isLoading}
          className="remove-btn"
        >
          Remove
        </button>
      </div>
    ));
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + item.discountedPrice * item.quantity;
    }, 0);
  };

  return (
    <div className="cart-container">
      {cartItems.length > 0 ? (
        <>
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button onClick={handleClearCart} disabled={isLoading}>
              Clear Shopping Cart
            </button>
          </div>

          <div className="cart-items">{renderCartItems()}</div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>{calculateTotal().toFixed(2)}BDT</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>$0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>{calculateTotal().toFixed(2)}BDT</span>
            </div>

            <button
              className="checkout-btn"
              disabled={isLoading}
              onClick={() => {
                // Navigate to checkout
              }}
            >
              Proceed to Checkout
            </button>
          </div>

          {/* Show user info if logged in */}
          {user && (
            <div className="user-info">
              <small>
                Your cart is saved to your account: {user.email}
              </small>
            </div>
          )}
        </>
      ) : (
        <div className="empty-cart">
          <p>Your cart is empty!</p>
          <a href="/shop" className="continue-shopping">
            Continue Shopping
          </a>
        </div>
      )}
    </div>
  );
};

export default CartComponentExample;
