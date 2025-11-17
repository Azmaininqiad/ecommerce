import { createSPAClient } from './client';

export interface CartItemDB {
  id: string;
  user_id: string;
  product_id: number;
  product_title: string;
  product_price: number;
  product_discounted_price: number | null;
  product_image: string | null;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Fetch all cart items for the current user
export async function fetchUserCart(): Promise<CartItemDB[]> {
  const supabase = createSPAClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return [];
  }

  const { data, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching cart:', error);
    return [];
  }

  return data || [];
}

// Add item to cart in database
export async function addItemToCartDB(
  productId: number,
  productTitle: string,
  productPrice: number,
  productDiscountedPrice: number | null,
  productImage: string | null,
  quantity: number
): Promise<CartItemDB | null> {
  const supabase = createSPAClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return null;
  }

  // First, check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existingItem) {
    // Update quantity if item exists
    const { data, error } = await supabase
      .from('cart_items')
      .update({
        quantity: existingItem.quantity + quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      return null;
    }
    return data;
  }

  // Insert new item
  const { data, error } = await supabase
    .from('cart_items')
    .insert({
      user_id: user.id,
      product_id: productId,
      product_title: productTitle,
      product_price: productPrice,
      product_discounted_price: productDiscountedPrice,
      product_image: productImage,
      quantity: quantity,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding to cart:', error);
    return null;
  }

  return data;
}

// Update item quantity in database
export async function updateCartItemQuantityDB(
  cartItemId: string,
  quantity: number
): Promise<CartItemDB | null> {
  const supabase = createSPAClient();

  if (quantity <= 0) {
    await removeItemFromCartDB(cartItemId);
    return null;
  }

  const { data, error } = await supabase
    .from('cart_items')
    .update({
      quantity: quantity,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cartItemId)
    .select()
    .single();

  if (error) {
    console.error('Error updating cart item quantity:', error);
    return null;
  }

  return data;
}

// Remove item from database
export async function removeItemFromCartDB(cartItemId: string): Promise<boolean> {
  const supabase = createSPAClient();

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing cart item:', error);
    return false;
  }

  return true;
}

// Clear all cart items for the current user
export async function clearUserCartDB(): Promise<boolean> {
  const supabase = createSPAClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Error getting user:', userError);
    return false;
  }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing cart:', error);
    return false;
  }

  return true;
}

// Sync local cart to database
export async function syncCartToDB(cartItems: any[]): Promise<boolean> {
  try {
    const supabase = createSPAClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error getting user:', userError);
      return false;
    }

    // Clear existing cart
    await clearUserCartDB();

    // Add all items from local cart
    if (cartItems.length > 0) {
      const itemsToInsert = cartItems.map((item) => ({
        user_id: user.id,
        product_id: item.id,
        product_title: item.title,
        product_price: item.price,
        product_discounted_price: item.discountedPrice,
        product_image: item.imgs?.thumbnails?.[0] || null,
        quantity: item.quantity,
      }));

      const { error } = await supabase
        .from('cart_items')
        .insert(itemsToInsert);

      if (error) {
        console.error('Error syncing cart to database:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error syncing cart:', error);
    return false;
  }
}
