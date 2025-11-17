# Quick Setup Checklist - Cart Database Integration

## ✅ Prerequisites
- [ ] Supabase project set up and running
- [ ] Authentication system is working (users can sign up/sign in)
- [ ] Redux store is configured
- [ ] Supabase client is properly configured

## 📁 Files Created
- [x] `/supabase_cart_table.sql` - Database migration script
- [x] `/src/lib/supabase/cart.ts` - Cart database functions
- [x] `/src/hooks/useCartSync.ts` - Custom hooks for cart synchronization
- [x] `/CART_DATABASE_INTEGRATION.md` - Comprehensive documentation
- [x] `/CART_COMPONENT_EXAMPLE.tsx` - Example component implementation

## 📝 Files Modified
- [x] `/src/redux/features/cart-slice.ts` - Added database ID tracking
- [x] `/contexts/AuthContext.tsx` - Added cart loading on sign-in

## 🚀 Step-by-Step Setup

### Step 1: Execute Database Migration
```
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Open the file: supabase_cart_table.sql
4. Copy and paste the entire contents into SQL Editor
5. Click "Run" to execute
6. Verify: Check if "cart_items" table appears in Tables section
```

### Step 2: Verify File Locations
```
Ensure all new files are in correct locations:
✓ src/lib/supabase/cart.ts
✓ src/hooks/useCartSync.ts
✓ CART_DATABASE_INTEGRATION.md
✓ CART_COMPONENT_EXAMPLE.tsx
✓ supabase_cart_table.sql
```

### Step 3: Verify Modifications
```
Check these files were updated:
✓ src/redux/features/cart-slice.ts
  - Should have loadCartFromDB action
  - Should have setCartItemDBId action
  - CartItem type should have dbId?: string

✓ contexts/AuthContext.tsx
  - Should import useDispatch and cart functions
  - Should load cart on sign-in
  - Should clear cart on sign-out
```

### Step 4: Update Your Components
```
In each component that modifies cart (add, remove, update quantity):

1. Import necessary functions:
   import { useRemoveFromCart, useUpdateCartItemQuantity } from '@/hooks/useCartSync';
   import { removeItemFromCart, updateCartItemQuantity } from '@/redux/features/cart-slice';

2. Update Redux and Database:
   // Remove item
   dispatch(removeItemFromCart(itemId));
   if (user && item.dbId) {
     await removeItemFromCartDB(item.dbId);
   }

3. Refer to CART_COMPONENT_EXAMPLE.tsx for patterns
```

### Step 5: Test the Implementation
```
Test 1: Sign up and add items
  - Create account → Add items → Refresh page
  - Expected: Cart persists

Test 2: Multiple users
  - User A: sign in → add items → sign out
  - User B: sign in → verify empty cart
  - User A: sign in → verify original items

Test 3: Update quantities
  - Add item → Change quantity → Refresh
  - Expected: Quantity persists

Test 4: Remove items
  - Add items → Remove one → Refresh
  - Expected: Item stays removed

Test 5: Clear cart
  - Add items → Click "Clear Cart" → Refresh
  - Expected: Cart stays empty
```

## 🔧 Common Integration Points

### Adding Item to Cart
```typescript
// In your product card or quick view component:
const handleAddToCart = async () => {
  // Add to Redux
  dispatch(addItemToCart({
    id: product.id,
    title: product.title,
    price: product.price,
    discountedPrice: product.discountedPrice,
    quantity: 1,
    imgs: product.images,
  }));

  // Add to database if logged in
  if (user) {
    const result = await addItemToCartDB(
      product.id,
      product.title,
      product.price,
      product.discountedPrice,
      product.images?.thumbnails?.[0],
      1
    );
    if (result) {
      // Optionally update Redux with dbId
      dispatch(setCartItemDBId({
        productId: product.id,
        dbId: result.id,
      }));
    }
  }
};
```

### Updating Quantity
```typescript
const handleQuantityChange = async (newQuantity) => {
  // Update Redux
  dispatch(updateCartItemQuantity({
    id: item.id,
    quantity: newQuantity,
  }));

  // Update database
  if (user && item.dbId) {
    await updateCartItemQuantityDB(item.dbId, newQuantity);
  }
};
```

### Removing Item
```typescript
const handleRemoveItem = async (itemId, dbId) => {
  // Remove from Redux
  dispatch(removeItemFromCart(itemId));

  // Remove from database
  if (user && dbId) {
    await removeItemFromCartDB(dbId);
  }
};
```

## 🛡️ Security Checklist
- [ ] RLS policies are enabled on cart_items table
- [ ] Users can only see their own cart items
- [ ] All cart operations require user authentication
- [ ] Foreign keys are set up correctly
- [ ] Cascading deletes are working

## ⚡ Performance Optimization (Optional)
- [ ] Add debouncing to cart updates (e.g., 500ms delay)
- [ ] Implement error retry logic for failed database operations
- [ ] Cache cart data locally to reduce database calls
- [ ] Use batch operations when clearing cart

## 🐛 Troubleshooting

### Issue: Cart not loading after sign-in
**Solution:**
1. Check browser console for errors
2. Verify auth context is updated with Redux dispatch
3. Check Supabase RLS policies
4. Verify database connection in cart.ts

### Issue: Items appearing twice
**Solution:**
1. Clear browser localStorage
2. Reload page
3. Check Redux state in browser dev tools

### Issue: "Permission Denied" errors
**Solution:**
1. Verify RLS policies are created in Supabase
2. Check user is authenticated before DB operations
3. Verify user_id is being sent correctly

### Issue: Items not persisting
**Solution:**
1. Check that DB functions are being called
2. Verify user is logged in before database writes
3. Check Supabase activity logs for errors
4. Verify cart_items table exists

## 📚 Documentation Files
- `CART_DATABASE_INTEGRATION.md` - Full documentation with examples
- `CART_COMPONENT_EXAMPLE.tsx` - Sample component implementation
- `supabase_cart_table.sql` - Database schema and RLS policies

## ✨ Next Steps After Setup
1. **Test thoroughly** with multiple user accounts
2. **Monitor database** for any errors
3. **Implement caching** for better performance
4. **Add error handling** for production
5. **Consider pagination** if users have many cart items

## 📞 Need Help?
1. Check `CART_DATABASE_INTEGRATION.md` for detailed explanations
2. Review `CART_COMPONENT_EXAMPLE.tsx` for implementation patterns
3. Check Supabase logs for database errors
4. Verify browser console for JavaScript errors

---

**Status**: Ready for implementation ✅
**Last Updated**: November 14, 2025
