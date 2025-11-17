# Cart Database Integration Guide

## Overview
Your e-commerce application now supports persistent cart storage in the Supabase database. Each user's cart is linked to their account, and cart data persists across sessions.

## Database Schema

### New Table: `cart_items`
The following table was created to store cart data:

```sql
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id bigint NOT NULL,
  product_title character varying NOT NULL,
  product_price numeric NOT NULL,
  product_discounted_price numeric,
  product_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  UNIQUE (user_id, product_id)
);
```

### Key Features:
- **RLS (Row Level Security)**: Users can only view, update, and delete their own cart items
- **Cascading Deletes**: When a user or product is deleted, their cart items are automatically removed
- **Unique Constraint**: Only one entry per user-product combination (updates quantity instead of duplicating)
- **Indexes**: Optimized for fast lookups by user_id and product_id

## Implementation Steps

### Step 1: Execute the SQL Migration
Run the SQL script in your Supabase dashboard:

1. Open [supabase_cart_table.sql](./supabase_cart_table.sql)
2. Copy the entire contents
3. Go to your Supabase project → SQL Editor
4. Paste the SQL and execute it
5. Verify the table was created successfully

### Step 2: File Structure
New and modified files in your project:

```
src/
├── lib/supabase/
│   └── cart.ts                 (NEW) - Database functions for cart operations
├── hooks/
│   └── useCartSync.ts          (NEW) - Custom hooks for cart synchronization
└── redux/features/
    └── cart-slice.ts           (MODIFIED) - Added database ID tracking
contexts/
└── AuthContext.tsx             (MODIFIED) - Loads cart on user sign-in
```

## Core Functions

### `cart.ts` - Database Operations

#### `fetchUserCart()`
Fetches all cart items for the current user from the database.
```typescript
const cartItems = await fetchUserCart();
```

#### `addItemToCartDB(productId, productTitle, productPrice, productDiscountedPrice, productImage, quantity)`
Adds or updates a product in the user's cart.
```typescript
const result = await addItemToCartDB(
  1,
  'Product Name',
  99.99,
  79.99,
  'image-url.jpg',
  1
);
```

#### `updateCartItemQuantityDB(cartItemId, quantity)`
Updates the quantity of a cart item.
```typescript
const result = await updateCartItemQuantityDB('cart-item-uuid', 5);
```

#### `removeItemFromCartDB(cartItemId)`
Removes a cart item from the database.
```typescript
const success = await removeItemFromCartDB('cart-item-uuid');
```

#### `clearUserCartDB()`
Clears all cart items for the current user.
```typescript
const success = await clearUserCartDB();
```

#### `syncCartToDB(cartItems)`
Syncs local Redux cart state to the database (useful for migrating guest cart data).
```typescript
const success = await syncCartToDB(localCartItems);
```

## Redux Integration

### New Redux Actions

#### `loadCartFromDB(cartItems)`
Loads cart items from the database into Redux state.
```typescript
dispatch(loadCartFromDB(formattedItems));
```

#### `setCartItemDBId(productId, dbId)`
Sets the database ID for a cart item (used for tracking database records).
```typescript
dispatch(setCartItemDBId({ productId: 1, dbId: 'uuid-string' }));
```

### Existing Redux Actions
All existing cart actions continue to work:
- `addItemToCart`
- `removeItemFromCart`
- `updateCartItemQuantity`
- `removeAllItemsFromCart`

## Authentication Flow

### Sign-In Process
1. User signs in via AuthContext
2. `loadUserCart()` is automatically triggered
3. Cart items are fetched from the database
4. Redux store is populated with user's cart data
5. Cart display updates with user's items

### Sign-Out Process
1. User signs out
2. Cart state is cleared from Redux
3. Local session is cleared

## How to Use in Components

### Example 1: Adding Item to Cart with Database Sync
```typescript
import { useAddToCart } from '@/hooks/useCartSync';
import { useAppDispatch } from '@/redux/store';
import { addItemToCart } from '@/redux/features/cart-slice';

function ProductCard({ product }) {
  const dispatch = useAppDispatch();
  const addToCartDB = useAddToCart();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    // Add to Redux store
    dispatch(addItemToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discountedPrice,
      quantity: 1,
      imgs: product.images,
    }));

    // Sync to database if logged in
    if (user) {
      await addToCartDB(
        product.id,
        product.title,
        product.price,
        product.discountedPrice,
        product.images?.thumbnails?.[0],
        1
      );
    }
  };

  return (
    <button onClick={handleAddToCart}>Add to Cart</button>
  );
}
```

### Example 2: Updating Cart Item Quantity
```typescript
import { useUpdateCartItemQuantity } from '@/hooks/useCartSync';
import { useAppDispatch } from '@/redux/store';
import { updateCartItemQuantity } from '@/redux/features/cart-slice';

function CartItemQuantityControl({ item }) {
  const dispatch = useAppDispatch();
  const updateQuantityDB = useUpdateCartItemQuantity();
  const { user } = useAuth();

  const handleQuantityChange = async (newQuantity) => {
    // Update Redux
    dispatch(updateCartItemQuantity({
      id: item.id,
      quantity: newQuantity,
    }));

    // Update database if logged in
    if (user && item.dbId) {
      await updateQuantityDB(item.dbId, newQuantity);
    }
  };

  return (
    <input 
      type="number" 
      value={item.quantity}
      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
    />
  );
}
```

### Example 3: Removing Item from Cart
```typescript
import { useRemoveFromCart } from '@/hooks/useCartSync';
import { useAppDispatch } from '@/redux/store';
import { removeItemFromCart } from '@/redux/features/cart-slice';

function CartItemDeleteButton({ item }) {
  const dispatch = useAppDispatch();
  const removeFromCartDB = useRemoveFromCart();
  const { user } = useAuth();

  const handleRemove = async () => {
    // Remove from Redux
    dispatch(removeItemFromCart(item.id));

    // Remove from database if logged in
    if (user && item.dbId) {
      await removeFromCartDB(item.dbId);
    }
  };

  return (
    <button onClick={handleRemove}>Delete</button>
  );
}
```

## Guest vs Logged-In Users

### Guest Users (Not Signed In)
- Cart data stored only in Redux (local state)
- Data persists during the session but is lost on page refresh
- No database synchronization

### Logged-In Users
- Cart data stored in both Redux and database
- Data persists across sessions and devices
- Automatic synchronization on sign-in
- Each user sees their own cart data

### Guest to Registered User Flow
When a guest user signs up:
1. Their local Redux cart is preserved
2. On first sign-in, sync the local cart to database using `syncCartToDB()`
3. On subsequent sign-ins, user's database cart is loaded

## Security Features

### Row Level Security (RLS)
All queries are protected by RLS policies:
- Users can only SELECT their own cart items
- Users can only INSERT items for themselves
- Users can only UPDATE/DELETE their own items
- Database enforces these rules at the query level

### Foreign Key Constraints
- Cart items are linked to valid users (ON DELETE CASCADE)
- Cart items are linked to valid products (ON DELETE CASCADE)
- Prevents orphaned or invalid data

## Performance Optimization

### Database Indexes
The implementation includes indexes on:
- `user_id` - For fast user lookups
- `product_id` - For product lookups
- `(user_id, product_id)` - For unique constraint enforcement

### Recommended Optimizations
1. **Debounce Updates**: Wrap cart updates in a debounce function to avoid excessive database writes
2. **Lazy Load**: Only load cart on initial sign-in, not on every session refresh
3. **Cache**: Consider caching cart data client-side to reduce database calls
4. **Batch Operations**: Group multiple cart changes before syncing to database

## Troubleshooting

### Cart not loading after sign-in
1. Check that user is properly authenticated
2. Verify RLS policies are enabled on the table
3. Check browser console for error messages
4. Ensure database URL and API keys are correct

### Items appearing twice in cart
1. This indicates a duplicate between Redux state and database
2. Clear Redux state and reload from database using `loadCartFromDB([])`
3. Then reload the page

### Permission Denied errors
1. Verify RLS policies are correctly set up
2. Check that user is authenticated before database operations
3. Ensure the user_id in the JWT matches the auth.users table

### Items not persisting
1. Check that you're calling database functions after Redux updates
2. Verify the user is logged in before database writes
3. Check Supabase activity logs for errors

## Testing the Implementation

### Manual Testing Steps

1. **Test 1: Sign up and add items**
   - Create a new account
   - Add items to cart
   - Refresh page - cart should persist
   - Check Supabase cart_items table for entries

2. **Test 2: Multiple users**
   - Sign in as User A, add items
   - Sign out and sign in as User B
   - User B should see different cart
   - Sign back in as User A, original cart should be there

3. **Test 3: Update quantities**
   - Add item to cart
   - Change quantity
   - Refresh page - quantity should persist

4. **Test 4: Remove items**
   - Add multiple items
   - Remove one item
   - Refresh page - should stay removed

## Next Steps

1. **Run the SQL migration** in your Supabase dashboard
2. **Test the implementation** with manual testing
3. **Update your Cart components** to use the new sync hooks
4. **Monitor performance** and optimize as needed
5. **Add error handling** for production deployments

## Additional Resources

- [Supabase JavaScript Client Documentation](https://supabase.com/docs/reference/javascript)
- [Row Level Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## Support

For issues or questions:
1. Check the Supabase logs in your dashboard
2. Review browser console for error messages
3. Verify all files were created in correct locations
4. Ensure database migration was executed successfully
