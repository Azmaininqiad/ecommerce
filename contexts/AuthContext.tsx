'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createSPAClient } from '@/components/Common/lib/supabase/client';
import { useDispatch } from 'react-redux';
import { loadCartFromDB } from '@/redux/features/cart-slice';
import { fetchUserCart } from '@/lib/supabase/cart';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const supabase = createSPAClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Load cart from database if user is logged in
      if (session?.user) {
        loadUserCart();
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Load cart when user signs in
      if (event === 'SIGNED_IN' && session?.user) {
        loadUserCart();
      }
      
      // Clear cart when user signs out
      if (event === 'SIGNED_OUT') {
        dispatch(loadCartFromDB([]));
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  const loadUserCart = async () => {
    try {
      const cartItems = await fetchUserCart();
      
      // Convert database cart items to Redux format
      const formattedItems = cartItems.map((item) => ({
        id: item.product_id,
        title: item.product_title,
        price: Number(item.product_price),
        discountedPrice: item.product_discounted_price ? Number(item.product_discounted_price) : Number(item.product_price),
        quantity: item.quantity,
        dbId: item.id,
        imgs: item.product_image ? {
          thumbnails: [item.product_image],
          previews: [item.product_image],
        } : undefined,
      }));
      
      dispatch(loadCartFromDB(formattedItems));
    } catch (error) {
      console.error('Error loading cart from database:', error);
    }
  };

  const signOut = async () => {
    const supabase = createSPAClient();
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};