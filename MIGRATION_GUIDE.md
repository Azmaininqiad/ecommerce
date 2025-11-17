# Migration Guide: Adding Database Cart Storage

## Overview
This guide helps you integrate database cart storage into your existing e-commerce application. The migration allows your current local Redux cart to persist to the database for authenticated users.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  User Application                    │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Components (Add to Cart, Cart Page, etc.)          │
│         ↓                                             │
│  Redux Store (cartReducer.items)                    │
│    ├─ Local State                                    │
│    └─ Database IDs (dbId)                            │
│         ↓                                             │
│  Cart Sync Hooks & Functions                        │
│    ├─ useAddToCart()                                 │
│    ├─ useUpdateCartItemQuantity()                   │
│    └─ useRemoveFromCart()                            │
│         ↓                                             │
└─────────────┬──────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────┐
│               Supabase Backend                       │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Authentication (auth.users)                        │
│         ↓                                             │
│  Cart Items Table (cart_items)                      │
│    ├─ RLS Policies (User-specific access)          │
│    ├─ Foreign Keys (user_id, product_id)           │
│    └─ Indexes (user_id, product_id)                │
│         ↓                                             │
└─────────────────────────────────────────────────────┘
```

## Phase 1: Database Setup

### Step 1.1: Create Cart Items Table
Execute the SQL migration in Supabase:

```bash
File: supabase_cart_table.sql
```

This creates:
- `cart_items` table with proper structure
- Row Level Security (RLS) policies
- Indexes for performance

### Step 1.2: Verify Table Creation
In Supabase dashboard:
1. Go to **SQL Editor** → **Saved queries**
2. Run a test query:
```sql
SELECT * FROM public.cart_items LIMIT 1;
```

Should return an empty result (no error).

## Phase 2: Code Integration

### Step 2.1: Add New Files

Copy these files to your project:
```
✓ src/lib/supabase/cart.ts        - Database operations
✓ src/hooks/useCartSync.ts        - Sync helpers
```

### Step 2.2: Update Existing Files

Modify these files:
```
✓ src/redux/features/cart-slice.ts - Add loadCartFromDB, setCartItemDBId actions
✓ contexts/AuthContext.tsx         - Load cart on sign-in
```

## Phase 3: Component Updates

### Step 3.1: Update Add to Cart
**File**: `src/components/Common/ProductItem.tsx` (or your product component)

```typescript
import { useAuth } from '../../../contexts/AuthContext';
import { addItemToCartDB } from '@/lib/supabase/cart';
import { setCartItemDBId } from '@/redux/features/cart-slice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleAddToCart = async () => {
    // Add to Redux
    dispatch(addItemToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      discountedPrice: product.discounted_price || product.price,
      quantity: 1,
      imgs: product.images,
    }));

    // Sync to database
    if (user) {
      const result = await addItemToCartDB(
        product.id,
        product.title,
        product.price,
        product.discounted_price,
        product.images?.thumbnails?.[0],
        1
      );
      if (result) {
        dispatch(setCartItemDBId({
          productId: product.id,
          dbId: result.id,
        }));
      }
    }
  };

  return <button onClick={handleAddToCart}>Add to Cart</button>;
};
```

### Step 3.2: Update Cart Page
**File**: `src/components/Cart/index.tsx` (or `src/components/Cart/SingleItem.tsx`)

```typescript
import { useRemoveFromCart, useUpdateCartItemQuantity } from '@/hooks/useCartSync';
import { useAuth } from '../../../contexts/AuthContext';

const SingleItem = ({ item }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const removeFromDB = useRemoveFromCart();
  const updateQuantityDB = useUpdateCartItemQuantity();

  const handleRemove = async () => {
    dispatch(removeItemFromCart(item.id));
    if (user && item.dbId) {
      await removeFromDB(item.dbId);
    }
  };

  const handleQuantityChange = async (newQuantity) => {
    dispatch(updateCartItemQuantity({ 
      id: item.id, 
      quantity: newQuantity 
    }));
    if (user && item.dbId) {
      await updateQuantityDB(item.dbId, newQuantity);
    }
  };

  return (
    <>
      <input 
        type="number"
        value={item.quantity}
        onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
      />
      <button onClick={handleRemove}>Remove</button>
    </>
  );
};
```

### Step 3.3: Update Clear Cart Button
**File**: `src/components/Cart/index.tsx`

```typescript
import { clearUserCartDB } from '@/lib/supabase/cart';

const handleClearCart = async () => {
  if (!confirm('Clear cart?')) return;
  
  dispatch(removeAllItemsFromCart());
  
  if (user) {
    await clearUserCartDB();
  }
};
```

## Phase 4: Guest to User Migration

Handle guests converting to registered users:

### Step 4.1: Create Migration Hook
**File**: `src/hooks/useCartMigration.ts`

```typescript
import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/store';
import { useAuth } from '../contexts/AuthContext';
import { syncCartToDB } from '@/lib/supabase/cart';

export const useCartMigration = () => {
  const cartItems = useAppSelector(state => state.cartReducer.items);
  const { user, loading } = useAuth();
  const dispatch = useAppDispatch();
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!loading && user && cartItems.length > 0 && !migratedRef.current) {
      // Only migrate once per session
      migratedRef.current = true;
      
      // Check if cart already synced to database
      const hasDbIds = cartItems.some(item => item.dbId);
      
      if (!hasDbIds) {
        // Sync local cart to database
        syncCartToDB(cartItems);
      }
    }
  }, [user, loading, cartItems]);
};
```

### Step 4.2: Use in Layout
**File**: `src/app/layout.tsx` or your main layout

```typescript
export default function RootLayout() {
  // ... existing code ...
  useCartMigration();
  
  return (
    // ... existing JSX ...
  );
}
```

## Phase 5: Testing

### Test Case 1: New User Flow
```
1. Clear localStorage (DevTools → Application → Clear site data)
2. Create new account
3. Add items to cart
4. Refresh page → Cart should persist
5. Check Supabase dashboard → cart_items table should have entries
```

### Test Case 2: Existing User
```
1. Sign in with existing account
2. Cart should load from database
3. Add new items
4. Refresh page → All items should be there
```

### Test Case 3: Multiple Users
```
1. Sign in as User A → Add items
2. Sign out
3. Sign in as User B → Should see empty cart
4. Sign out
5. Sign in as User A → Should see original items
```

### Test Case 4: Update Operations
```
1. Add item with quantity 1
2. Change quantity to 5
3. Refresh page → Should show 5
4. Check database → quantity should be 5
```

### Test Case 5: Delete Operations
```
1. Add item
2. Remove item
3. Refresh page → Item should be gone
4. Check database → No entry for product
```

## Performance Considerations

### Debouncing Updates
For better performance, debounce cart updates:

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

const updateQuantityDB = useMemo(() => 
  debounce(async (cartItemId, quantity) => {
    await updateCartItemQuantityDB(cartItemId, quantity);
  }, 500),
  []
);
```

### Batch Operations
When clearing cart, batch delete instead of individual deletes:

```typescript
// Good - Batch delete
const { error } = await supabase
  .from('cart_items')
  .delete()
  .eq('user_id', userId);

// Avoid - Loop of deletes
for (const item of cartItems) {
  await removeItemFromCartDB(item.dbId);
}
```

## Rollback Plan

If you need to revert this feature:

### Step 1: Remove Database References
Remove or comment out:
- `import` statements from cart.ts
- Database sync calls
- AuthContext cart loading

### Step 2: Clear Database
```sql
DROP TABLE IF EXISTS public.cart_items CASCADE;
```

### Step 3: Revert File Changes
- Restore original `cart-slice.ts`
- Restore original `AuthContext.tsx`

### Step 4: Test
- Clear localStorage
- Verify cart works with Redux only

## Troubleshooting

### Problem: Cart empty after sign-in
**Diagnosis:**
1. Check browser console for errors
2. Verify user ID in auth
3. Check Supabase logs

**Solution:**
```typescript
// Add logging to AuthContext
console.log('Loading cart for user:', user?.id);
const items = await fetchUserCart();
console.log('Fetched items:', items);
```

### Problem: "Permission denied" errors
**Cause:** RLS policies not correctly applied

**Solution:**
```sql
-- Verify RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'cart_items';

-- Should return: true for relrowsecurity
```

### Problem: Database not updating
**Diagnosis:**
1. Verify user is authenticated
2. Check if dispatch is being called
3. Monitor network requests

**Solution:**
```typescript
// Add error logging
const result = await addItemToCartDB(...);
if (!result) {
  console.error('Database operation failed');
  toast.error('Failed to save to cart');
}
```

## Monitoring

### Track Success Metrics
- % of carts saved to database
- Average cart load time
- Database query performance
- Error rates

### Useful Queries
```sql
-- See all cart items for a user
SELECT * FROM cart_items 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- Cart item count by user
SELECT user_id, COUNT(*) as item_count
FROM cart_items
GROUP BY user_id;

-- Recently updated items
SELECT * FROM cart_items
WHERE updated_at > NOW() - INTERVAL '1 hour'
ORDER BY updated_at DESC;
```

## Next Steps

After successful implementation:

1. **Monitor performance** - Track database queries
2. **Gather feedback** - See if users like persistent carts
3. **Optimize** - Add caching, debouncing if needed
4. **Enhance** - Add features like saved carts, wishlists
5. **Scale** - Plan for growth with database optimization

## Support & Debugging

### Enable Verbose Logging
```typescript
// In cart.ts, add logging
export async function fetchUserCart() {
  console.log('[Cart] Fetching cart...');
  // ... code ...
  console.log('[Cart] Fetched items:', data?.length);
}
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Project Settings → Logs
3. Filter by table name: `cart_items`
4. Check for errors

### Verify RLS Policies
```typescript
// Test query in SQL Editor
SELECT * FROM cart_items
WHERE user_id = auth.uid();
-- Should show only current user's items
```

---

**Migration Status**: Ready for Production ✅
**Last Updated**: November 14, 2025
