lanjutkan pengembangan frontend untuk customer booking yang mengintegrasikan API dari folder /web-booking backend, dan fokus aplikasi frontend booking di folder projek web-booking-view


cek Implement POST /bookings, dengan detail :
1. POST /utils/calculate-price
2. real-time updates
3. tambahkan tax callculation and va admin sebagai ve 3500 per transaksi
4. buatkan supaya muncul icon chart di header, supaya setiap penambahan dan pengurangan items bisa terlihat angkanya di icon cart
5. di backend service folder web-booking/ gunakan web-booking/docs/Maja.md sebagai refrensi payment gateway
6. get token maja di url berikut `https://account.makaramas.com/auth/realms/maja/protocol/openid-connect/token`
7. url register va di https://billing.maja.id/api/v2/register
8. example request 
{
  "date": "2021-02-28",
  "amount": 100000,
  "name": "Alfiyah",
  "email": "alfiyah@sebuahdomain.com",
  "attribute1": "Fasilkom",
  "attribute2": "Manajemen Sistem Informasi",
  "items": [
    {
      "description": "Registration",
      "unitPrice": 100000,
      "qty": 1,
      "amount": 100000
    }
  ],
  "paymentMethod": "bni"
}
9. example response 
{
    "date": "2024-02-28",
    "amount": 750000,
    "name": "anto",
    "email": "anto@anto.com",
    "address": "Depok",
    "attribute1": "PCR SWAB",
    "attribute2": "2021-02-28",
    "paymentMethod": "bni",
    "items": [
        {
            "description": "PCR SWAB",
            "unitPrice": 750000,
            "qty": 1,
            "amount": 750000
        }
    ],
    "attributes": []
}. parameter items untuk rincian

gunakan credential untuk maja 
MAJA_AUTH_URL=https://account.makaramas.com/auth/realms/maja/protocol/openid-connect/token
MAJA_API_URL=https://billing.maja.id/api/v2
MAJA_CLIENT_ID=MAJA80113
MAJA_CLIENT_SECRET=B31tMd8VBkFqTcyKddVqTbPdDP2XmpzD
MAJA_USERNAME=80113
MAJA_PASSWORD=80113

gunakan crdential untuk login customer
kode tenant MAJU1234 (case sensitive!)
username : budi@email.com
password : password123

jangan gunakan tenant id, x-tenant id ataupun id tenant lagi, tapi gunakan kode tenan, di seluruh codebase backend dan frontend. pertahankan konsistensi codebase yang sudah ada

gunakan docker-compose restart api untuk restart backend

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
