# 🧪 Cart CRUD Testing Guide

## Quick Test Checklist

### ✅ Test 1: Delete Item
- [ ] Add any product to cart
- [ ] Click the delete/trash button
- [ ] Verify: Item disappears instantly
- [ ] Verify: Toast shows "Item removed from cart"
- [ ] (If logged in) Refresh page → Item should still be gone
- [ ] ✅ PASS

### ✅ Test 2: Update Quantity (Increase)
- [ ] Add product to cart
- [ ] Click the `+` button
- [ ] Verify: Quantity increases (e.g., 1 → 2)
- [ ] Verify: Total price updates
- [ ] Click `+` multiple times
- [ ] Verify: Can increase to any quantity
- [ ] (If logged in) Refresh → Quantity persists
- [ ] ✅ PASS

### ✅ Test 3: Update Quantity (Decrease)
- [ ] Add product to cart (quantity = 1)
- [ ] Try clicking `-` button
- [ ] Verify: Button is disabled (can't go to 0)
- [ ] Add multiple items (quantity = 3+)
- [ ] Click `-` button
- [ ] Verify: Quantity decreases
- [ ] (If logged in) Refresh → Quantity persists
- [ ] ✅ PASS

### ✅ Test 4: Clear Cart
- [ ] Add multiple products
- [ ] Click "Clear Shopping Cart" button
- [ ] Verify: Confirmation dialog appears
- [ ] Click "OK" on confirmation
- [ ] Verify: All items disappear
- [ ] Verify: Toast shows success message
- [ ] (If logged in) Refresh → Cart is still empty
- [ ] ✅ PASS

### ✅ Test 5: Delete with Error Handling
- [ ] Go offline (DevTools → Network → Offline)
- [ ] Add item to cart
- [ ] Try to delete
- [ ] Verify: Item disappears from UI (optimistic)
- [ ] Verify: Error toast appears
- [ ] Go online
- [ ] Try deleting again
- [ ] Verify: Works and syncs
- [ ] ✅ PASS

### ✅ Test 6: Multi-User Isolation
- [ ] Open 2 browser windows/incognito tabs
- [ ] Log in with different accounts
- [ ] Add items in both carts
- [ ] Verify: Each user sees only their cart
- [ ] Delete item in one → Other user's cart unchanged
- [ ] Clear one cart → Other user's cart unchanged
- [ ] ✅ PASS

### ✅ Test 7: Guest User Workflow
- [ ] Don't log in (stay as guest)
- [ ] Add items to cart
- [ ] Delete items
- [ ] Update quantities
- [ ] Clear cart
- [ ] Verify: All operations work
- [ ] Refresh page
- [ ] Verify: Cart is empty (no persistence for guests in DB)
- [ ] ✅ PASS

### ✅ Test 8: Concurrent Operations
- [ ] Add item to cart
- [ ] Quickly click increase quantity 5 times
- [ ] Verify: No errors or duplicate updates
- [ ] Wait for all operations to complete
- [ ] Verify: Final quantity is correct
- [ ] ✅ PASS

## Expected UI Behavior

### Delete Button
```
Normal State:  [🗑️ Delete]
Loading State: [🗑️ Delete] (disabled, 50% opacity)
```

### Quantity Controls
```
Increase Button:
- Enabled: [➕]
- Disabled (during load): [➕] (50% opacity, cursor: not-allowed)

Decrease Button:
- Enabled (qty > 1): [➖]
- Disabled (qty = 1): [➖] (50% opacity, cursor: not-allowed)
- Disabled (during load): [➖] (50% opacity, cursor: not-allowed)
```

### Clear Cart Button
```
Normal State:  [Clear Shopping Cart]
Loading State: [Clearing...] (disabled, 50% opacity)
```

### Toast Notifications
```
Success:     "Item removed from cart" (green)
Error:       "Failed to remove item" (red)
Success:     "Cart cleared successfully" (green)
Error:       "Error clearing cart" (red)
```

## Console Logs to Monitor

### Successful Delete
```
✅ Item removed from Redux
✅ API call: removeItemFromCartDB(dbId)
✅ Toast: "Item removed from cart"
```

### Successful Quantity Update
```
✅ Quantity updated in Redux
✅ API call: updateCartItemQuantityDB(dbId, newQty)
✅ Redux updated: updateCartItemQuantity
```

### Successful Clear
```
✅ Cart cleared from Redux
✅ API call: clearUserCartDB()
✅ Toast: "Cart cleared successfully"
```

### Error Case
```
❌ Toast: "Failed to remove item"
❌ Redux rolled back to previous state
❌ Check browser console for error details
```

## Performance Expectations

### Instant Feedback (< 100ms)
- ✅ UI updates immediately
- ✅ Button gets disabled
- ✅ Toast notification appears

### Database Sync (1-2 seconds)
- ✅ Database updates in background
- ✅ User can continue shopping
- ✅ Silent success (no delay)
- ✅ Error shown if sync fails

## Network Scenarios

### Scenario 1: Fast Connection
```
1. Click delete
2. Item disappears immediately ✅
3. Database syncs in background ✅
4. Refresh → Item still gone ✅
```

### Scenario 2: Slow Connection (3-5s)
```
1. Click delete
2. Item disappears immediately ✅
3. Button stays disabled while waiting ✅
4. Toast shows after 3-5s ✅
5. Refresh → Item still gone ✅
```

### Scenario 3: Offline / Connection Error
```
1. Go offline
2. Click delete
3. Item disappears (optimistic) ✅
4. Error toast after timeout ✅
5. Go online
6. Try again → Works ✅
7. Refresh → Item stays gone (optimistic was correct) ✅
```

### Scenario 4: Server Error
```
1. Network is fine
2. Server returns error (500, etc.)
3. Item disappears (optimistic) ✅
4. After 2-3s, error toast ✅
5. Item re-appears in cart ✅
6. User can retry ✅
```

## Test Results Template

```markdown
# Cart CRUD Operations Test Results

Date: ___________
Tester: ___________
Browser: ___________
Device: ___________

## Test Results

| Test | Status | Notes |
|------|--------|-------|
| Delete Item | ⚪ | |
| Increase Quantity | ⚪ | |
| Decrease Quantity | ⚪ | |
| Clear Cart | ⚪ | |
| Error Handling | ⚪ | |
| Multi-User | ⚪ | |
| Guest User | ⚪ | |
| Concurrent Ops | ⚪ | |

## Issues Found
- [ ] No issues
- [ ] Minor issues
- [ ] Major issues

### Issue Details
(List any bugs found)

## Performance Notes
- Load time: ______ms
- Sync time: ______ms
- Success rate: ____%

## Sign-off
- [ ] Ready for production
- [ ] Needs fixes
```

## Debugging Tips

### If Delete Doesn't Work
1. Check browser console for errors
2. Verify user is logged in (if expected)
3. Check network tab → see if API call is made
4. Check Supabase dashboard → verify cart_items table

### If Quantity Update Doesn't Sync
1. Open DevTools → Network tab
2. Click increase button
3. Look for POST request to updateCartItemQuantityDB
4. Check response status (should be 200)
5. Refresh page → verify quantity persists

### If Clear Cart Doesn't Work
1. Check confirmation dialog appears
2. Click OK on confirmation
3. Check network tab for API call
4. Verify all items disappear
5. Check Supabase → cart_items table should be empty

### If Buttons Stay Disabled
1. Check browser console for errors
2. Verify Redux state updated
3. Check network request completed
4. Refresh page and try again

## Quick Commands

### Test in Incognito (Guest User)
```bash
# Open new Incognito tab
Cmd + Shift + N (Mac)
Ctrl + Shift + N (Windows)

# Test cart without logging in
```

### Test on Mobile
```bash
# DevTools → Device toolbar (Cmd + Shift + M)
# Test touch interactions
```

### Simulate Offline
```bash
DevTools → Network tab
Throttling → Offline
(Perform operations)
Throttling → Online
```

### Monitor Network Requests
```bash
DevTools → Network tab
Filter by: fetch/XHR
Perform cart operations
Check request/response
```

## Success Criteria

### ✅ All PASS if:
1. Delete removes item immediately
2. Delete syncs to database (if logged in)
3. Increase quantity works and persists
4. Decrease quantity works and persists
5. Clear cart shows confirmation
6. Clear cart removes all items
7. All operations show loading state
8. Toast notifications appear
9. Error handling works offline
10. Multi-user isolation works

### 🚨 FAIL if:
1. Any operation takes >5 seconds
2. Redux and database become out of sync
3. Buttons don't disable during operation
4. Toast notifications don't appear
5. Error handling doesn't work
6. Users can see other users' carts

---

**Status**: Ready for QA Testing
**Last Updated**: November 14, 2025
