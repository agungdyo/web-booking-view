# AGENTS.md - Web Booking View (Frontend)

Panduan development untuk project web-booking-view sebagai frontend aplikasi booking.

## Overview

Project ini adalah frontend consumer untuk API backend web-booking. Bertugas menampilkan dan mengelola proses pemesanan untuk customer.

## Tech Stack

- **Framework**: Vanilla JavaScript + HTML/CSS
- **Build Tool**: Vite
- **HTTP Client**: Fetch API
- **State Management**: LocalStorage + Context pattern
- **Styling**: Custom CSS (Mobile-first, responsive)
- **Icons**: Lucide Icons
- **Date Picker**: Flatpickr

## Project Structure

```
web-booking-view/
├── index.html              # Main entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js             # App entry point
│   ├── app.js              # Main app class
│   ├── api/
│   │   └── client.js       # API client (fetch wrapper)
│   ├── services/
│   │   ├── auth.service.js  # Authentication
│   │   ├── item.service.js # Items/catalog
│   │   ├── booking.service.js # Bookings
│   │   ├── payment.service.js # Payments
│   │   └── customer.service.js # Customer public
│   ├── pages/
│   │   ├── home.page.js
│   │   ├── catalog.page.js
│   │   ├── item-detail.page.js
│   │   ├── booking.page.js
│   │   ├── payment.page.js
│   │   ├── booking-status.page.js
│   │   ├── login.page.js
│   │   └── register.page.js
│   ├── components/
│   │   ├── header.component.js
│   │   ├── footer.component.js
│   │   ├── item-card.component.js
│   │   ├── booking-form.component.js
│   │   ├── cart.component.js
│   │   └── modal.component.js
│   ├── utils/
│   │   ├── router.js       # Simple SPA router
│   │   ├── storage.js      # LocalStorage helper
│   │   ├── format.js       # Currency, date formatters
│   │   └── validation.js   # Form validation
│   └── styles/
│       ├── main.css        # Main styles
│       ├── variables.css   # CSS variables
│       ├── components.css  # Component styles
│       └── responsive.css  # Responsive utilities
├── public/
│   └── favicon.ico
└── CLAUDE.md               # This file
```

## API Integration

### Base URL
```
Development: http://localhost:3000/api/v1
```

### Public Endpoints (No Auth Required)
```javascript
// Authentication
POST /auth/login                    # Login customer
POST /customers/public              # Register customer
GET  /customers/:id/bookings       # Get customer bookings

// Items (Public)
GET  /public/items                  # List items (uses X-Tenant-ID header)
GET  /public/items/:id              # Get item details
GET  /public/items/:id/availability # Check availability
GET  /public/items/types            # Get item types

// Booking
GET  /bookings/track/:code          # Track booking by code

// Utils
POST /utils/calculate-price         # Calculate booking price
```

### Protected Endpoints (Auth Required)
```javascript
// Customer Auth Token Required
POST /bookings                      # Create booking
GET  /bookings/:id                  # Get booking details
```

### Header Requirements
```javascript
// For public endpoints
X-Tenant-ID: <tenant_uuid>  // Header approach (RECOMMENDED)

OR use kode parameter in URL:
GET /public/items?kode=MAJU1234

// For authenticated requests
Authorization: Bearer <token>
Content-Type: application/json
```

## Tenant Configuration

Frontend support multi-tenant dengan dua cara konfigurasi:

### Option 1: Via Kode Tenant (Recommended for public)
```javascript
// Include kodeTenant in request body or query
const kodeTenant = 'MAJU1234';
```

### Option 2: Via Header
```javascript
X-Tenant-ID: 550e8400-e29b-41d4-a716-446655440001
```

### Tenant Lookup Flow
```javascript
// Get tenant info by kode
GET /tenants/kode/:kode
// Returns: { id, name, domain, logo, settings }
```

## User Flows

### 1. Customer Registration & Booking Flow
```
Home → Catalog → Item Detail → Login/Register → Booking Form → Payment → Confirmation
```

### 2. Guest Booking Flow
```
Home → Catalog → Item Detail → Booking Form (enter data) → Login/Register → Payment
```

### 3. Track Booking Flow
```
Home → Track Booking → Enter Code → View Status
```

## Key Components

### Header Component
- Logo + Tenant name
- Navigation: Beranda, Katalog, Lacak Booking
- Auth buttons: Login/Daftar or User Menu
- Mobile: Hamburger menu

### Item Card Component
- Item image (primary)
- Item name
- Item type badge
- Price display
- Availability indicator
- Book Now button

### Booking Form Component
- Date range picker
- Quantity selector
- Selected items list
- Price calculation
- Notes textarea
- Submit button

### Cart Component
- Selected items
- Date selection
- Subtotal
- Tax calculation
- Total

### Modal Component
- Reusable modal wrapper
- Close button
- Title slot
- Content slot

## State Management

### App State
```javascript
{
  tenant: { id, name, kode, logo, settings },
  customer: { id, name, email, token } | null,
  cart: { items: [], dates: { start, end }, notes },
  currentPage: string,
  loading: boolean,
  error: string | null
}
```

### Storage Keys
```javascript
- 'wb_tenant_id'     // Selected tenant ID
- 'wb_customer'      // Customer data + token
- 'wb_cart'          // Shopping cart
```

## Routing

### Routes
```javascript
/                    → HomePage
/katalog             → CatalogPage
/item/:id            → ItemDetailPage
/booking             → BookingPage
/booking/:id         → BookingDetailPage
/payment/:id         → PaymentPage
/booking-status/:code → BookingStatusPage
/login               → LoginPage
/register            → RegisterPage
/track               → TrackPage
```

### Route Guard
- `/booking`, `/payment/:id` → Requires login
- Redirect to `/login?redirect=/booking` if not authenticated

## Form Validation

### Customer Registration
```javascript
{
  name: { required: true, minLength: 2 },
  email: { required: true, pattern: emailRegex },
  phone: { required: true, pattern: phoneRegex },
  password: { required: true, minLength: 6 }
}
```

### Booking Form
```javascript
{
  startDate: { required: true },
  endDate: { required: true },
  items: { required: true, minItems: 1 }
}
```

## Error Handling

### API Error Response Format
```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: [{ field: 'email', message: 'Email required' }]
  }
}
```

### Error Display
- Toast notifications for transient errors
- Inline field errors for form validation
- Error pages for critical failures

## Performance

### Optimization
- Lazy load page components
- Image lazy loading
- Debounce search input
- Cache item list (5 min TTL)
- Skeleton loading states

### Mobile Optimization
- Touch-friendly buttons (min 44px)
- Swipeable image gallery
- Bottom navigation bar
- Collapsible sections

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Color contrast compliance

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_DEFAULT_TENANT=MAJU1234
```
