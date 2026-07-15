# Complete Booking Flow Implementation Summary

## ✅ Status: COMPLETE

## Backend (web-booking)

### API Endpoints Available

#### Public Routes (No Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/public/tenants/kode/:kode` | Get tenant by kode |
| GET | `/api/v1/public/items` | List items catalog |
| GET | `/api/v1/public/items/:id` | Get item details |
| GET | `/api/v1/public/items/types` | Get item types |
| GET | `/api/v1/public/items/:id/availability` | Check availability |
| GET | `/api/v1/public/items/:id/availability-calendar` | Get availability calendar |

#### Customer Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/customers/login` | No | Customer login |
| POST | `/api/v1/customers/public` | No | Customer registration |
| GET | `/api/v1/customers/me` | Bearer | Get current customer |
| GET | `/api/v1/customers/:id/bookings` | Bearer | Get customer bookings |

#### Booking Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/bookings` | Bearer | Create booking |
| GET | `/api/v1/bookings/:id` | Bearer | Get booking details |
| GET | `/api/v1/bookings/track/:code` | No | Track booking by code |

#### Payment Routes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/payments/initiate` | Bearer | Initiate payment (create VA) |
| POST | `/api/v1/payments/callback` | No | MAJA webhook callback |

## Frontend (web-booking-view)

### Services
- `src/services/auth.service.js` - Customer authentication
- `src/services/booking.service.js` - Booking operations
- `src/services/payment.service.js` - Payment operations
- `src/services/item.service.js` - Item catalog
- `src/services/tenant.service.js` - Tenant management
- `src/services/cart-storage.service.js` - Cart persistence

### Pages
- `src/pages/home.page.js` - Home page
- `src/pages/catalog.page.js` - Item catalog
- `src/pages/item-detail.page.js` - Item detail
- `src/pages/login.page.js` - Customer login
- `src/pages/register.page.js` - Customer registration
- `src/pages/booking.page.js` - Booking form
- `src/pages/payment.page.js` - Payment with VA
- `src/pages/my-bookings.page.js` - Customer bookings list
- `src/pages/track.page.js` - Track booking by code

### Components
- `src/components/header.component.js` - Header
- `src/components/footer.component.js` - Footer
- `src/components/cart.component.js` - Shopping cart
- `src/components/toast.component.js` - Toast notifications

## Booking Flow

```
1. Customer browses catalog (public)
   GET /public/items?kode=MAJU1234

2. Customer adds items to cart (local storage)

3. Customer logs in
   POST /customers/login?kode=MAJU1234
   Body: {email, password}
   Response: {customer, token}

4. Customer fills booking form

5. Customer submits booking
   POST /bookings
   Headers: Authorization: Bearer {token}, kode: MAJU1234
   Body: {customerId, startDate, endDate, items[], notes}
   Response: {id, code, status: "pending", total}

6. Redirect to /payment/:bookingId

7. Customer selects payment method (BNI/Mandiri/BCA/BRI)

8. Initiate payment (creates VA)
   POST /payments/initiate
   Headers: Authorization: Bearer {token}, kode: MAJU1234
   Body: {bookingId, paymentMethod: "bni"}
   Response: {id, vaNumber, instructions}

9. Display VA number and instructions

10. Customer pays via bank ATM/mobile

11. MAJA sends webhook callback
    POST /payments/callback
    Body: {code, number, amount, va, bankCode...}
    
12. Backend updates booking status to "confirmed"

13. Customer can check status
    GET /bookings/:id
    GET /customers/:id/bookings
```

## Credentials

### MAJA Payment Gateway
- Auth URL: `https://account.makaramas.com/auth/realms/maja/protocol/openid-connect/token`
- API URL: `https://billing.maja.id/api/v2`
- Client ID: `MAJA80113`
- Client Secret: `B31tMd8VBkFqTcyKddVqTbPdDP2XmpzD`
- Username: `80113`
- Password: `80113`

### Customer Login
- Kode Tenant: `MAJU1234`
- Email: `budi@email.com`
- Password: `password123`

## Running the Application

### Start Backend
```bash
cd web-booking
docker-compose up -d api
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

2. **Customer Token**: Customer authentication uses Bearer token from `/customers/login`

3. **MAJA Integration**: Payment requires valid MAJA credentials (already configured)

4. **Date Format**: Use ISO format (YYYY-MM-DD) for all date fields

5. **Item IDs**: Get valid item IDs from `/public/items` endpoint with kode parameter
