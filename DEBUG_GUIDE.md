# Debug Guide - Items Not Displaying

## Quick Test

1. **Test API directly:**
   ```bash
   curl "http://localhost:3000/api/v1/public/items?kode=MAJU1234&page=1&limit=4"
   ```

2. **Run API test script:**
   ```bash
   node test-api.js
   ```

3. **Open env check page:**
   - Start dev server: `npm run dev`
   - Open: `http://localhost:5173/env-check.html`

4. **Open debug test page:**
   - Open: `http://localhost:5173/debug-test.html`

## Browser Console Debug

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to catalog page
4. Look for these logs:

```
[ItemService] getTenantCode: { fromStorage, fromEnv, result }
[ItemService] Getting items, tenantCode: MAJU1234
[ItemService] API params: {...}
[ItemService] Raw response: {...}
[Catalog] loadItems called with params: {...}
[Catalog] Calling itemService.getItems...
[Catalog] API Response received: {...}
```

## Common Issues

### Issue 1: Environment variables not loaded
**Symptom:** `tenantCode` shows as undefined in logs

**Fix:** Ensure `.env` file exists with:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_TENANT=MAJU1234
```

### Issue 2: API returns data but items array is empty
**Symptom:** `response.success` is true but `items.length` is 0

**Check:** Verify the response data structure matches expected format.

### Issue 3: API call fails
**Symptom:** Console shows fetch error or CORS error

**Fix:** 
- Ensure backend is running on port 3000
- Check CORS configuration in backend

### Issue 4: Items render but not visible
**Symptom:** HTML is generated but nothing shows

**Fix:** Check CSS for `.items-grid` and `.item-card` classes.

## File Structure for Debugging

```
web-booking-view/
├── .env                          # Environment variables (IMPORTANT!)
├── .env.development              # Dev-specific env (optional)
├── env-check.html               # Check if VITE vars load
├── debug-test.html              # Simple API test
├── test-api.js                  # Node.js API test script
└── src/
    ├── services/
    │   └── item.service.js      # API calls with logging
    ├── pages/
    │   ├── catalog.page.js      # Catalog page with logging
    │   └── home.page.js         # Home page with logging
    └── api/
        └── client.js           # Fetch wrapper
```

## Expected Console Output (Success)

```
[App] Starting initialization...
[App] Initializing tenant...
[TenantService] Initializing tenant...
[TenantService] Found tenant code: MAJU1234
[TenantService] Tenant loaded: PT Maju Jaya
[App] Tenant initialized: PT Maju Jaya

// When navigating to catalog:
[Catalog] loadItems called with params: {...}
[Catalog] Calling itemService.getItems...
[ItemService] getTenantCode: { fromStorage: null, fromEnv: 'MAJU1234', result: 'MAJU1234' }
[ItemService] Getting items, tenantCode: MAJU1234
[ItemService] API params: { kode: 'MAJU1234', page: 1, limit: 12 }
[ItemService] Raw response: { success: true, data: [...], meta: {...} }
[Catalog] API Response received: {...}
[Catalog] response.success: true
[Catalog] response.data: [...]
[Catalog] Final items to render: [...]
[Catalog] Rendering 12 items
[Catalog] Items rendered successfully
```
