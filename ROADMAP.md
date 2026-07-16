# ROADMAP.md - Web Booking View (Frontend)

## Overview
Project frontend untuk customer booking yang mengintegrasikan API dari web-booking backend.

---

## Phase 1: Foundation & Setup (Week 1)

### Goals
- Setup project structure
- Initialize Vite + Vanilla JS
- Create base CSS framework
- Setup routing system
- Setup API client

### Tasks

#### Day 1-2: Project Initialization
```
[x] Create project structure
[x] Initialize package.json
[x] Install dependencies
    ├── vite (dev)
    ├── lucide (icons)
    └── flatpickr (date picker)
[x] Setup vite.config.js
[x] Create index.html entry
[x] Create .env.example
```

#### Day 3-4: Core Infrastructure
```
[x] Create CSS framework
    ├── variables.css (colors, spacing, typography)
    ├── reset.css (CSS reset)
    ├── components.css (reusable components)
    └── responsive.css (media queries)
[x] Create utility functions
    ├── storage.js (LocalStorage wrapper)
    ├── format.js (currency, date formatters)
    └── validation.js (form validators)
[x] Create API client
    ├── base fetch wrapper
    ├── error handling
    └── response parsing
```

#### Day 5-7: Router & App Shell
```
[x] Create simple SPA router
    ├── route definitions
    ├── route matching
    ├── navigation handling
    └── 404 page
[x] Create app shell
    ├── main.js entry point
    ├── app.js (main app class)
    ├── header component
    └── footer component
[x] Create home page template
    ├── hero section
    ├── featured items
    └── quick actions
```

### Deliverables
- [x] Project builds and runs
- [x] Basic routing works
- [x] API client functional
- [x] CSS framework ready

---

## Phase 2: Public Pages (Week 2)

### Goals
- Create catalog page
- Create item detail page
- Implement search & filter
- Create tenant configuration

### Tasks

#### Day 1-3: Catalog Page
```
[x] Create catalog page
    ├── item grid layout
    ├── filter sidebar
    │   ├── type filter
    │   ├── price range filter
    │   └── availability filter
    ├── search bar
    └── pagination
[x] Create item card component
    ├── image display
    ├── name & type badge
    ├── price display
    ├── availability indicator
    └── CTA button
[x] Implement API integration
    ├── GET /items (list)
    ├── GET /items/types
    └── loading states
```

#### Day 4-5: Item Detail Page
```
[x] Create item detail page
    ├── image gallery
    ├── item info (name, type, description)
    ├── specifications display
    ├── price display
    └── availability checker
[x] Create date picker integration
    ├── Flatpickr setup
    ├── range selection
    └── disable booked dates
[x] Add to cart functionality
```

#### Day 6-7: Tenant & Configuration
```
[ ] Implement tenant lookup
    ├── GET /tenants/kode/:kode
    ├── dynamic branding
    └── settings integration
[ ] Create tenant selector
[ ] Handle multi-tenant scenarios
```

### Deliverables
- [X] Catalog page functional
- [X] Item search & filter works
- [X] Item detail page displays correctly
- [X] Date picker integrated
- [X] Multi-tenant support ready

---

## Phase 3: Booking Flow (Week 3)

### Goals
- Create booking form
- Implement cart functionality
- Price calculation
- Create booking via API

### Tasks

#### Day 1-2: Cart System
```
[x] Create cart component
    ├── selected items list
    ├── quantity controls
    ├── date selection
    ├── remove item
    └── clear cart
[x] Implement cart storage
    ├── save to localStorage
    ├── restore on page load
    └── sync across tabs
[x] Create cart drawer/modal
```

#### Day 3-4: Booking Form
```
[x] Create booking page
    ├── customer info form
    ├── date confirmation
    ├── item list summary
    ├── price breakdown
    ├── notes textarea
    └── submit button
[x] Create booking form component
    ├── form validation
    ├── error display
    └── loading state
[x] Implement form validation
    ├── required fields
    ├── email format
    ├── phone format
    └── date validation
```

#### Day 5-7: Booking API Integration
```
[x] Implement POST /bookings
    ├── send booking data
    ├── handle response
    ├── store booking ID
    └── redirect to payment
[X] Create booking success page
    ├── booking code display
    ├── summary
    └── next steps
[ ] Implement price calculation
    ├── POST /utils/calculate-price
    ├── real-time updates
    └── tax calculation
```

### Deliverables
- [ ] Cart system works
- [ ] Booking form functional
- [ ] Booking created successfully
- [ ] Price calculation accurate
- [ ] Booking confirmation displayed

---

## Phase 4: Payment Integration (Week 4)

### Goals
- Create payment page
- Integrate with payment gateway
- Handle payment status
- Display payment instructions

### Tasks

#### Day 1-2: Payment Page
```
[ ] Create payment page
    ├── booking summary
    ├── amount display
    ├── payment method selection
    └── proceed button
[ ] Create payment method component
    ├── bank transfer option
    ├── e-wallet option
    └── credit card option
```

#### Day 3-4: Payment API Integration
```
[ ] Implement POST /payments/initiate
    ├── send payment request
    ├── handle response
    └── store payment info
[ ] Create payment URL handling
    ├── redirect to gateway
    └── return URL handling
[ ] Implement payment status polling
```

#### Day 5-7: Payment Confirmation
```
[ ] Create payment success page
    ├── confirmation message
    ├── booking details
    └── download invoice button
[ ] Create payment failed page
    ├── failure message
    ├── retry option
    └── contact support
[ ] Create payment pending page
    ├── instructions display
    ├── countdown timer
    └── refresh status
```

### Deliverables
- [ ] Payment page functional
- [ ] Payment initiation works
- [ ] Payment gateway redirect works
- [ ] Payment confirmation displayed
- [ ] Error handling complete

---

## Phase 5: Customer Portal (Week 5)

### Goals
- Create login page
- Create registration page
- Customer dashboard
- Booking history

### Tasks

#### Day 1-2: Authentication
```
[ ] Create login page
    ├── email/password form
    ├── remember me
    ├── forgot password link
    └── submit button
[ ] Create register page
    ├── name field
    ├── email field
    ├── phone field
    ├── password field
    └── register button
[ ] Implement auth services
    ├── POST /auth/login
    ├── POST /customers/public
    └── token management
```

#### Day 3-4: Customer Dashboard
```
[ ] Create customer layout
    ├── sidebar navigation
    ├── profile section
    └── mobile menu
[ ] Create dashboard home
    ├── welcome message
    ├── recent bookings
    └── quick actions
[ ] Create profile page
    ├── view/edit profile
    ├── change password
    └── logout
```

#### Day 5-7: Booking History
```
[ ] Create my bookings page
    ├── booking list
    ├── status badges
    ├── date filter
    └── pagination
[ ] Create booking detail page
    ├── full booking info
    ├── items list
    ├── payment status
    └── download invoice
[ ] Implement track booking
    ├── GET /bookings/track/:code
    └── public access
```

### Deliverables
- [ ] Login/Register works
- [ ] Customer dashboard functional
- [ ] Booking history displays
- [ ] Track booking works
- [ ] Profile management ready

---

## Phase 6: Polish & Mobile (Week 6)

### Goals
- Mobile optimization
- UI/UX polish
- Error handling
- Performance optimization

### Tasks

#### Day 1-2: Mobile Optimization
```
[ ] Mobile navigation
    ├── bottom nav bar
    ├── hamburger menu
    └── touch gestures
[ ] Responsive images
    ├── lazy loading
    ├── responsive srcset
    └── placeholders
[ ] Touch-friendly UI
    ├── button sizing
    ├── swipeable carousel
    └── pull to refresh
```

#### Day 3-4: UI Polish
```
[ ] Loading states
    ├── skeleton screens
    ├── spinner components
    └── progress indicators
[ ] Toast notifications
    ├── success toast
    ├── error toast
    ├── warning toast
    └── auto dismiss
[ ] Modal improvements
    ├── animations
    ├── backdrop blur
    └── trap focus
[ ] Animations
    ├── page transitions
    ├── micro-interactions
    └── scroll animations
```

#### Day 5-7: Error Handling & Testing
```
[ ] Error pages
    ├── 404 page
    ├── 500 page
    ├── network error page
    └── maintenance page
[ ] Form error handling
    ├── inline errors
    ├── server validation display
    └── retry mechanisms
[ ] Testing
    ├── cross-browser testing
    ├── mobile testing
    └── usability testing
[ ] Performance
    ├── bundle optimization
    ├── lazy loading
    └── caching headers
```

### Deliverables
- [ ] Fully responsive
- [ ] All error states handled
- [ ] Performance optimized
- [ ] Production ready

---

## Phase 7: Production (Week 7)

### Goals
- Production build
- Deployment setup
- Monitoring
- Documentation

### Tasks

#### Day 1-2: Deployment Prep
```
[ ] Production build
    ├── npm run build
    ├── asset optimization
    └── minification
[ ] Deployment config
    ├── nginx config
    ├── environment setup
    └── CORS configuration
[ ] SEO
    ├── meta tags
    ├── sitemap
    └── Open Graph tags
```

#### Day 3-4: Documentation
```
[ ] README.md
    ├── setup instructions
    ├── environment variables
    ├── API documentation
    └── troubleshooting
[ ] User guide
    ├── booking tutorial
    ├── payment guide
    └── FAQ
```

#### Day 5-7: Launch
```
[ ] Final testing
    ├── E2E testing
    ├── load testing
    └── security review
[ ] Deployment
    ├── deploy to server
    ├── configure domain
    └── SSL certificate
[ ] Monitoring setup
    ├── error tracking
    ├── analytics
    └── uptime monitoring
```

### Deliverables
- [ ] Production build successful
- [ ] Deployed to server
- [ ] Documentation complete
- [ ] Monitoring active

---

## Implementation Checklist

### Phase 1 Checklist
```
[ ] Project structure created
[ ] Vite configured
[ ] CSS framework ready
[ ] Router functional
[ ] API client working
```

### Phase 2 Checklist
```
[ ] Catalog page complete
[ ] Item detail page complete
[ ] Search & filter working
[ ] Date picker integrated
[ ] Tenant config ready
```

### Phase 3 Checklist
```
[ ] Cart system complete
[ ] Booking form working
[ ] Booking API integrated
[ ] Price calculation accurate
[ ] Booking confirmation shown
```

### Phase 4 Checklist
```
[ ] Payment page complete
[ ] Payment initiation works
[ ] Gateway integration done
[ ] Payment confirmation shown
```

### Phase 5 Checklist
```
[ ] Login/Register working
[ ] Customer dashboard done
[ ] Booking history displays
[ ] Track booking functional
```

### Phase 6 Checklist
```
[ ] Mobile responsive
[ ] Loading states complete
[ ] Error handling done
[ ] Performance optimized
```

### Phase 7 Checklist
```
[ ] Production build ready
[ ] Deployed
[ ] Documentation complete
[ ] Monitoring active
```

---

## API Endpoints Summary

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Customer login |
| POST | /customers/public | Register customer |
| GET | /items | List items |
| GET | /items/:id | Item details |
| GET | /items/:id/availability | Check availability |
| GET | /items/types | Get item types |
| GET | /tenants/kode/:kode | Get tenant info |
| POST | /utils/calculate-price | Calculate price |
| GET | /bookings/track/:code | Track booking |

### Protected Endpoints (Requires Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /customers/:id/bookings | Customer bookings |
| POST | /bookings | Create booking |
| GET | /bookings/:id | Booking details |
| POST | /payments/initiate | Initiate payment |
| GET | /payments/:id | Payment details |

---

## File Priority Order

### Must Have (MVP)
1. index.html, main.js, app.js
2. CSS framework (variables.css, main.css)
3. API client (client.js)
4. Router (router.js)
5. Header/Footer components
6. Home page
7. Catalog page
8. Item detail page
9. Cart component
10. Booking form
11. Booking service
12. Login/Register pages
13. Payment page

### Should Have
1. Toast notifications
2. Loading states
3. Error pages
4. Mobile navigation
5. Booking history

### Nice to Have
1. Animations
2. Skeleton loading
3. Invoice download
4. Social sharing
5. Push notifications

---

## Dependencies

### Required
- vite (dev)
- lucide (icons)

### Optional
- flatpickr (date picker)
- chart.js (analytics - future)
