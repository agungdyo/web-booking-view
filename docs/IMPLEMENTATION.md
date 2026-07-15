# Booking Flow Implementation Summary

## Frontend (web-booking-view)

### Files Created/Updated

#### Services
- `src/services/auth.service.js` - Customer authentication (login, register)
- `src/services/booking.service.js` - Booking operations (create, get, list)
- `src/services/payment.service.js` - Payment initiation
- `src/services/item.service.js` - Item catalog (public endpoints)
- `src/services/tenant.service.js` - Tenant management
- `src/services/cart-storage.service.js` - Cart persistence

#### Pages
- `src/pages/home.page.js` - Home page
- `src/pages/catalog.page.js` - Item catalog
- `src/pages/item-detail.page.js` - Item detail with booking
- `src/pages/login.page.js` - Customer login
- `src/pages/register.page.js` - Customer registration
- `src/pages/booking.page.js` - Booking form
- `src/pages/payment.page.js` - Payment with VA
- `src/pages/my-bookings.page.js` - Customer's bookings
- `src/pages/track.page.js` - Track booking by code

#### Components
- `src/components/header.component.js` - App header
- `src/components/footer.component.js` - App footer
- `src/components/cart.component.js` - Shopping cart drawer
- `src/components/toast.component.js` - Toast notifications

### API Integration

All frontend services use `kode` header for tenant identification:
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'kode': 'MAJU1234'
}
```

## Backend (web-booking)

### Key Files Updated

#### Routes
- `src/routes.js` - Main API routes
- `src/modules/customer/routes.js` - Customer routes (public + protected)
- `src/modules/booking/routes.js` - Booking routes
- `src/modules/payment/routes.js` - Payment routes
- `src/modules/item/public-routes.js` - Public item endpoints
- `src/modules/tenant/public-routes.js` - Public tenant endpoints

#### Controllers
- `src/modules/booking/controller.js` - Booking HTTP handlers
- `src/modules/payment/controller.js` - Payment HTTP handlers
- `src/modules/customer/controller.js` - Customer HTTP handlers

#### Services
- `src/modules/booking/service.js` - Booking business logic
- `src/modules/payment/service.js` - Payment with MAJA integration
- `src/utils/maja.js` - MAJA Payment Gateway integration

### API Endpoints

#### Public Endpoints (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /public/tenants/kode/:kode | Get tenant info |
| GET | /public/items | List items catalog |
| GET | /public/items/:id | Get item details |
| GET | /public/items/types | Get item types |
| GET | /public/items/:id/availability | Check availability |
| POST | /customers/login | Customer login |
| POST | /customers/public | Customer registration |

#### Protected Endpoints (Auth Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers/me | Get current customer |
| GET | /customers/:id/bookings | Get customer's bookings |
| POST | /bookings | Create booking |
| GET | /bookings/:id | Get booking details |
| POST | /payments/initiate | Initiate payment (create VA) |
| GET | /payments/:id | Get payment details |

## Booking Flow

```
1. Customer browses items (public catalog)
   ↓
2. Customer adds items to cart (local storage)
   ↓
3. Customer logs in (if not logged in)
   ↓
4. Customer fills booking form with dates
   ↓
5. Customer submits booking
   → POST /bookings (with Bearer token, kode header)
   ← Response: {id, code, status, total}
   ↓
6. Redirect to /payment/:bookingId
   ↓
7. Customer selects payment method (BNI/Mandiri/BCA/BRI)
   ↓
8. Customer initiates payment
   → POST /payments/initiate (creates VA via MAJA)
   ← Response: {vaNumber, instructions}
   ↓
9. Customer pays via bank ATM/mobile banking
   ↓
10. MAJA sends webhook callback
    → POST /payments/callback
    ← Updates booking status to "confirmed"
   ↓
11. Customer can view booking status
```

## Credentials

- **Kode Tenant**: `MAJU1234`
- **Customer Email**: `budi@email.com`
- **Customer Password**: `password123`

## Environment Configuration

### Backend (.env)
```
NODE_ENV=development
APP_PORT=3000
DB_HOST=localhost
DB_PORT=5437
DB_NAME=bookify
DB_USER=bookify
DB_PASSWORD=secret_password

# MAJA Payment Gateway
MAJA_AUTH_URL=https://account.makaramas.com/auth/realms/maja-demo/protocol/openid-connect/token
MAJA_API_URL=https://billing-dev.maja.id/api/v2
MAJA_CLIENT_ID=your_client_id
MAJA_CLIENT_SECRET=your_client_secret
MAJA_USERNAME=budi@email.com
MAJA_PASSWORD=password123
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_TENANT=MAJU1234
```

## Running the Application

### Start Backend
```bash
cd web-booking
npm run dev
```

### Start Frontend
```bash
cd web-booking-view
npm run dev
```

### Run Migrations
```bash
cd web-booking
node src/seeders/run.js
```

## Important Notes

1. **Tenant Identification**: Always use `kode` header or query parameter, NOT `x-tenant-id` or `tenant_id`

2. **Customer Token**: Customer authentication uses Bearer token obtained from `/customers/login`

3. **MAJA Integration**: Payment requires valid MAJA credentials. If MAJA fails, payment will return an error.

4. **Date Format**: Use ISO format (YYYY-MM-DD) for all date fields.

5. **Item IDs**: Get valid item IDs from `/public/items` endpoint with kode parameter.
