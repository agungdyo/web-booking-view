lanjutkan pengembangan frontend untuk customer booking yang mengintegrasikan API dari folder /web-booking backend, dan fokus aplikasi frontend booking di folder projek web-booking-view


cek create date picker integration, dengan detail :
1. flatpickr setup
2. range selection
3. disable booked dates


gunakan crdential
kode tenant MAJU1234 (case sensitive!)
username : budi@email.com
password : password123

jangan gunakan tenant id, x-tenant id ataupun id tenant lagi, tapi gunakan kode tenan, di seluruh codebase backend dan frontend


tampilan item mengarah ke endpoint http://localhost:3000/api/v1/public/items/ea42f7d8-3ca6-455e-acb1-a3d76ca8e0cb/availability?kode=MAJU1234&start_date=2026-07-10&end_date=2026-10-08, senhingga response error {"success":false,"error":{"code":"NOT_FOUND","message":"Endpoint not found"}}, sedangkan ada enpoint yang tersedia item nya yaitu http://localhost:3000/api/v1/public/items/ea42f7d8-3ca6-455e-acb1-a3d76ca8e0cb/availability?kode=MAJU1234&start_date=2026-07-10&end_date=2026-07-25&quantity=1, dengan response {"success":true,"data":{"itemId":"ea42f7d8-3ca6-455e-acb1-a3d76ca8e0cb","itemName":"Test Item Fix","startDate":"2026-07-10","endDate":"2026-07-25"}}, apakah yang di maksud oleh tampilan detail item adalah salah

lalu cek tampilan cart, di frontend tidak ada tampilan cart, apakah masuk ke halaman bookings?




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
