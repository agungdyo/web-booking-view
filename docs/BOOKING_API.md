# Booking Flow API Documentation

## Overview
This document describes the booking flow API endpoints for the web-booking system.

## Credentials
- **Kode Tenant**: `MAJU1234` (case sensitive)
- **Username**: `budi@email.com`
- **Password**: `password123`

## Important Notes
- Always use `kode` header or query parameter (NOT `x-tenant-id` or `tenant_id`)
- Customer authentication uses Bearer token from `/customers/login` endpoint

## API Endpoints

### 1. Public Endpoints (No Auth Required)

#### GET /api/v1/public/tenants/kode/:kode
Get tenant information by kode.
```bash
curl "http://localhost:3000/api/v1/public/tenants/kode/MAJU1234"
```

#### GET /api/v1/public/items
Get items catalog.
```bash
curl "http://localhost:3000/api/v1/public/items?kode=MAJU1234&limit=10"
```

#### GET /api/v1/public/items/:id
Get item details.
```bash
curl "http://localhost:3000/api/v1/public/items/{itemId}?kode=MAJU1234"
```

#### GET /api/v1/public/items/:id/availability
Check item availability for date range.
```bash
curl "http://localhost:3000/api/v1/public/items/{itemId}/availability?kode=MAJU1234&start_date=2026-07-20&end_date=2026-07-25"
```

### 2. Customer Authentication

#### POST /api/v1/customers/login
Customer login - returns Bearer token.
```bash
curl -X POST "http://localhost:3000/api/v1/customers/login?kode=MAJU1234" \
  -H "Content-Type: application/json" \
  -d '{"email":"budi@email.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "customer": {
      "id": "uuid",
      "kodeTenant": "MAJU1234",
      "name": "Budi Santoso",
      "email": "budi@email.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### POST /api/v1/customers/public
Register new customer.
```bash
curl -X POST "http://localhost:3000/api/v1/customers/public" \
  -H "Content-Type: application/json" \
  -H "kode: MAJU1234" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### 3. Booking Endpoints (Auth Required)

#### POST /api/v1/bookings
Create new booking.
```bash
curl -X POST "http://localhost:3000/api/v1/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -H "kode: MAJU1234" \
  -d '{
    "customerId": "uuid",
    "startDate": "2026-07-20",
    "endDate": "2026-07-22",
    "items": [
      {"itemId": "uuid", "quantity": 1, "days": 3}
    ],
    "notes": "Optional notes"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "booking-uuid",
    "code": "BK-20260715-0001",
    "status": "pending",
    "total": 6000000,
    "items": [...]
  }
}
```

#### GET /api/v1/bookings/:id
Get booking details.
```bash
curl "http://localhost:3000/api/v1/bookings/{bookingId}?kode=MAJU1234" \
  -H "Authorization: Bearer {token}"
```

#### GET /api/v1/customers/:id/bookings
Get customer's bookings.
```bash
curl "http://localhost:3000/api/v1/customers/{customerId}/bookings?kode=MAJU1234" \
  -H "Authorization: Bearer {token}"
```

### 4. Payment Endpoints (Auth Required)

#### POST /api/v1/payments/initiate
Initiate payment for a booking (creates VA via MAJA).
```bash
curl -X POST "http://localhost:3000/api/v1/payments/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -H "kode: MAJU1234" \
  -d '{"bookingId": "booking-uuid", "paymentMethod": "bni"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "payment-uuid",
    "bookingId": "booking-uuid",
    "bookingCode": "BK-20260715-0001",
    "amount": 6000000,
    "method": "bank_transfer",
    "provider": "maja",
    "status": "pending",
    "vaNumber": "88081234567",
    "invoiceNumber": "2501",
    "instructions": {
      "bank": "BNI",
      "instructions": [...]
    }
  }
}
```

## Booking Flow

### Complete Flow Diagram
```
1. Customer browses catalog
   GET /public/items?kode=MAJU1234

2. Customer selects item -> Add to cart (local storage)

3. Customer proceeds to booking
   POST /bookings (Auth: Bearer token, kode: MAJU1234)
   Body: {customerId, startDate, endDate, items[], notes}
   
   Response: {id, code, status, total}
   
4. Redirect to /payment/:bookingId

5. Customer selects payment method

6. Initiate payment
   POST /payments/initiate (Auth: Bearer token, kode: MAJU1234)
   Body: {bookingId, paymentMethod}
   
   Response: {vaNumber, instructions}

7. Customer pays via bank ATM/mobile

8. MAJA notifies callback (webhook)
   POST /payments/callback
   Body: {code, number, amount, va, bankCode...}
   
9. Booking status updated to "confirmed"

10. Customer can check status
    GET /bookings/:id
    GET /customers/:id/bookings
```

## Error Codes

| Code | Description |
|------|-------------|
| TENANT_REQUIRED | kode header/query is required |
| UNAUTHORIZED | No valid token |
| CUSTOMER_NOT_FOUND | Customer not found |
| BOOKING_NOT_FOUND | Booking not found |
| ITEM_NOT_FOUND | Item not found |
| ITEM_NOT_AVAILABLE | Item out of stock |
| INVALID_BOOKING_STATUS | Booking not in pending status |
| ALREADY_PAID | Booking already paid |
| MAJA_AUTH_ERROR | MAJA authentication failed |
| MAJA_REGISTER_ERROR | Failed to register invoice to MAJA |

## MAJA Payment Gateway

The system integrates with MAJA Billing System for virtual account payments.

### Supported Payment Methods
- `bni` - BNI Virtual Account
- `mandiri` - Mandiri Virtual Account
- `bca` - BCA Virtual Account
- `bri` - BRI Virtual Account

### MAJA Flow
1. Register invoice via MAJA API
2. Get Virtual Account number
3. Customer pays via bank
4. MAJA sends callback notification
5. Update booking status to confirmed
