lanjutkan pengembangan frontend untuk customer booking yang mengintegrasikan API dari folder /web-booking backend, dan fokus aplikasi frontend booking di folder projek web-booking-view


cek implement cart storage, dengan detail :
1. save to localStorage
2. restore on page load
3. sync across tabs
4. create cart drawer /modal


gunakan crdential
kode tenant MAJU1234 (case sensitive!)
username : budi@email.com
password : password123

jangan gunakan tenant id, x-tenant id ataupun id tenant lagi, tapi gunakan kode tenan, di seluruh codebase backend dan frontend. pertahankan konsistensi codebase yang sudah ada


check endpoint public-routes/ di backend apakah sudah tersedia enpoint nya




## API Integration - Completed

### Implemented Features:
1. **GET /items** - List items with pagination
2. **GET /items/types** - Get item types with counts
3. **Loading states** - Skeleton loading, error states, retry functionality
4. **Auto-login** - Demo credentials auto-login on app initialization

### Files Updated:
- `src/api/client.js` - Added getAuth/postAuth methods for authenticated requests
- `src/services/item.service.js` - Updated to use authenticated /items endpoints
- `src/services/auth.service.js` - Updated login to handle SSO-style auth
- `src/pages/catalog.page.js` - Added loading states, item types loading
- `src/pages/home.page.js` - Added loading states for featured items
- `src/main.js` - Added auto-login with demo credentials

### API Response Format:
```json
{
  "success": true,
  "data": [...],  // Array of items
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 31,
    "totalPages": 3
  },
  "summary": {
    "types": [
      { "type": "gedung", "count": 13 },
      { "type": "kendaraan", "count": 8 },
      { "type": "alat", "count": 7 },
      { "type": "lapangan", "count": 3 }
    ]
  }
}
```

### Test Results:
- Login: Success
- GET /items: Success (31 items, 11 pages)
- GET /items/types: Success (4 types)
