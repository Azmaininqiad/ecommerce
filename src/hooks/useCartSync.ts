import { useEffect } from 'react';
import { useAppSelector } from '@/redux/store';
import { useAuth } from '../../contexts/AuthContext';
import {
  addItemToCartDB,
  updateCartItemQuantityDB,
  removeItemFromCartDB,
} from '@/lib/supabase/cart';

// This hook syncs cart changes to the database
export const useCartSync = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // We'll track cart state separately to detect changes
    const syncCart = async () => {
      // Note: In a production app, you'd want to debounce this
      // and track which items have changed to avoid unnecessary updates
    };

    syncCart();
  }, [cartItems, user]);
};

// Helper hook to add item to cart and sync to DB (only if user is logged in)
export const useAddToCart = () => {
  const { user } = useAuth();

  return async (
    productId: number,
    productTitle: string,
    productPrice: number,
    productDiscountedPrice: number | null,
    productImage: string | null,
    quantity: number
  ) => {
    // If user is not logged in, just return null (cart is still in Redux)
    if (!user) {
      return null;
    }

    try {
      const result = await addItemToCartDB(
        productId,
        productTitle,
        productPrice,
        productDiscountedPrice,
        productImage,
        quantity
      );
      return result;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return null;
    }
  };
};

// Helper hook to update cart item quantity and sync to DB (only if user is logged in)
export const useUpdateCartItemQuantity = () => {
  const { user } = useAuth();

  return async (cartItemId: string, quantity: number) => {
    // If user is not logged in, just return null (cart is still in Redux)
    if (!user) {
      return null;
    }

    try {
      const result = await updateCartItemQuantityDB(cartItemId, quantity);
      return result;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
  };
};

// Helper hook to remove item from cart and sync to DB (only if user is logged in)
export const useRemoveFromCart = () => {
  const { user } = useAuth();

  return async (cartItemId: string) => {
    // If user is not logged in, just return false (cart is still in Redux)
    if (!user) {
      return false;
    }

    try {
      const result = await removeItemFromCartDB(cartItemId);
      return result;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  };
};
