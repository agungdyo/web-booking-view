lanjutkan pengembangan frontend untuk customer booking yang mengintegrasikan API dari folder /web-booking backend, dan fokus aplikasi frontend booking di folder projek web-booking-view

 bagaimana menggunakan input item di swagger dengan enpoint
  http://localhost:3000/api-docs/#/Items/post_items atau http://localhost:3000/api/v1/items
  , saat POST error {field: "specifications", message: ""specifications" must be of type object"}


cek create item card component, dengan detail :
1. item image display
2. name & type badge
    - price display
    - availability indicator
    - CTA button

juga cek AGENTS.md dan src/api/client.js apakah masih membutuhkan tenant id instead kode tenant


gunakan crdential
kode tenant MAJU1234 (case sensitive!)
username : admin@majujaya.id
password : password123


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
