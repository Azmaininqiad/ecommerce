# Troubleshooting Guide - Cart Functionality

## Issue: Products Still Can't Be Added to Cart

### Step 1: Check Browser Console
Look for any error messages in the browser developer tools (F12 → Console tab)

**Common Errors & Solutions**:

#### Error: "Could not find react-redux context value"
**Cause**: Provider order issue
**Solution**: 
1. Check `/src/app/(site)/layout.tsx`
2. Ensure `<ReduxProvider>` wraps `<AuthProvider>`
3. Restart dev server

#### Error: "Property 'discountedPrice' does not exist"
**Cause**: Using snake_case from API in camelCase Redux action
**Solution**: Already fixed in all components. Ensure files are saved and hot reload applied

#### Error: "User must be logged in to add to cart"
**Cause**: Older version of useCartSync hook
**Solution**: Update `/src/hooks/useCartSync.ts` - should now support guest users

### Step 2: Check Redux DevTools
Install Redux DevTools extension if you haven't already:
1. Open DevTools → Redux tab
2. Trigger "Add to Cart" action
3. Should see `addItemToCart` action dispatched
4. Check if cart items are in state

**Expected State**:
```json
{
  "cartReducer": {
    "items": [
      {
        "id": 1,
        "title": "Product Name",
        "price": 100,
        "discountedPrice": 80,
        "quantity": 1,
        "dbId": "uuid-string" // Only if user is logged in
      }
    ]
  }
}
```

### Step 3: Check Network Tab
If using database sync for logged-in users:
1. Open DevTools → Network tab
2. Add item to cart while logged in
3. Should see request to POST `/api/...` (if you have an endpoint)
4. Look for Supabase requests in the network tab

### Step 4: Verify Files Are Updated
Check these key files have the latest code:

**1. Layout Provider Order** (`/src/app/(site)/layout.tsx`):
```tsx
<ReduxProvider>           {/* This first */}
  <AuthProvider>          {/* This second */}
    {/* Other providers */}
  </AuthProvider>
</ReduxProvider>
```

**2. Add to Cart Function** (ProductItem, QuickViewModal, etc.):
Should have:
```tsx
dispatch(addItemToCart({
  id: product.id,
  title: product.title,
  price: product.price,
  discountedPrice: product.discounted_price || product.price,
  quantity: 1,
  imgs: product.imgs,
}));
```

**NOT**:
```tsx
dispatch(addItemToCart({
  ...product,
  quantity: 1,
}));
```

### Step 5: Clear Cache and Restart
1. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. Close dev server (Ctrl+C)
3. Run: `npm run dev` or `pnpm dev`
4. Refresh browser (Ctrl+F5)

## Issue: Cart Items Not Persisting After Refresh (Logged-In Users)

### Check 1: Is Supabase Connected?
```tsx
// Test in browser console:
const { createSPAClient } = await import('@/lib/supabase/client.ts');
const supabase = createSPAClient();
const { data: { user } } = await supabase.auth.getUser();
console.log(user); // Should show user object
```

### Check 2: Is Database Table Created?
1. Go to Supabase Dashboard
2. Check "Tables" section
3. Should see `cart_items` table
4. If missing, run the migration SQL from `supabase_cart_table.sql`

### Check 3: Are RLS Policies Enabled?
1. Go to `cart_items` table settings
2. Check "Row Level Security (RLS)" is enabled
3. Should see 4 policies: SELECT, INSERT, UPDATE, DELETE

### Check 4: Are Policies Correct?
Each policy should check `auth.uid() = user_id`

Example for SELECT policy:
```sql
SELECT auth.uid() = user_id
```

### Check 5: Test Database Query
In browser console:
```tsx
const { fetchUserCart } = await import('@/lib/supabase/cart.ts');
const items = await fetchUserCart();
console.log(items); // Should show your cart items
```

## Issue: Database Errors When Adding to Cart

### Error: "Row-level security (RLS) is not enabled"
**Solution**:
1. Go to Supabase Dashboard
2. Select `cart_items` table
3. Click "Enable RLS"
4. Add the 4 policies from `supabase_cart_table.sql`

### Error: "Policy violates RLS policy"
**Cause**: Current user_id doesn't match the policy
**Check**:
1. Verify `auth.uid()` matches the `user_id` in cart_items
2. Make sure user is actually logged in
3. Check JWT token is valid

### Error: "Foreign key violation"
**Cause**: Referenced product or user doesn't exist
**Solution**:
1. Verify product exists in `products` table
2. Verify user exists in `auth.users`
3. Check product_id matches exactly

## Issue: Multiple Users Seeing Same Cart

### Check: Are RLS Policies Working?
1. Sign in as User A
2. Add item to cart
3. Check Supabase → cart_items table (Data view)
4. Should only see User A's items
5. Sign out and sign in as User B
6. Check table again - should NOT see User A's items

### If Everyone Sees Same Cart:
1. RLS is probably disabled
2. Go to Supabase Dashboard
3. Select cart_items table
4. Enable RLS
5. Verify policies exist

## Performance Issues: Slow Cart Operations

### Optimization 1: Check Database Queries
Add logging to `/src/lib/supabase/cart.ts`:
```typescript
console.time('fetchUserCart');
const data = await supabase.from('cart_items').select('*');
console.timeEnd('fetchUserCart');
```

### Optimization 2: Implement Debouncing
For quantity updates, debounce to reduce database calls:
```typescript
const debouncedUpdate = debounce((id, quantity) => {
  updateCartItemQuantityDB(id, quantity);
}, 500);
```

### Optimization 3: Use Indexes
Verify indexes exist in Supabase (should be created by migration):
- `cart_items_user_id_idx`
- `cart_items_product_id_idx`
- `cart_items_user_product_idx`

## Testing Checklist

```
Cart Functionality:
  [ ] Add item as guest - appears in cart
  [ ] Add item as logged-in user - appears in cart
  [ ] Refresh page as guest - cart stays (should, but might not persist)
  [ ] Refresh page as logged-in user - cart persists from database
  [ ] Sign in after adding items as guest - cart in Redux is kept
  [ ] Sign out - cart clears
  [ ] Sign in again - original cart loads
  [ ] Update quantity - syncs to database
  [ ] Remove item - syncs to database
  [ ] Clear cart - all items removed

Error Handling:
  [ ] Network error while adding - shows error toast
  [ ] Offline - can still add to Redux cart
  [ ] Database down - shows error, but Redux cart works
  [ ] Invalid user - shows error
  [ ] Invalid product - shows error
```

## Debug Mode

To enable detailed logging, add to your component:

```typescript
const handleAddToCart = async () => {
  console.log('🛒 Add to Cart clicked');
  console.log('User:', user);
  console.log('Product:', product);
  
  try {
    dispatch(addItemToCart({...}));
    console.log('✅ Redux updated');
    
    if (user) {
      const result = await addItemToCartDB(...);
      console.log('✅ Database synced:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};
```

## Still Having Issues?

1. **Check all files were updated**:
   - `/src/app/(site)/layout.tsx`
   - `/src/components/Common/ProductItem.tsx`
   - `/src/components/Common/QuickViewModal.tsx`
   - `/src/components/Wishlist/SingleItem.tsx`
   - `/src/lib/supabase/cart.ts`
   - `/contexts/AuthContext.tsx`

2. **Run migration** if you haven't:
   - Execute SQL from `supabase_cart_table.sql` in Supabase dashboard

3. **Check Supabase connection**:
   - Verify `.env.local` has correct Supabase URL and keys
   - Test connection in browser console

4. **Look at Supabase logs**:
   - Go to Supabase Dashboard → Logs
   - Check for any errors

5. **Check React errors**:
   - Look for warning/error boundaries
   - Check if components are properly wrapped in providers

## Getting Help

1. Check browser console (F12)
2. Check Supabase dashboard logs
3. Check network tab for failed requests
4. Enable debug logging
5. Review all modified files match documentation
6. Restart dev server
7. Clear cache and refresh

---

**Last Updated**: November 14, 2025
**Status**: All common issues documented
