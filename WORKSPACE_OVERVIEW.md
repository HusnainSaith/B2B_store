# Zerox-Store — Full Workspace Overview

> **Generated:** March 28, 2026
> **Repository:** HamzaDar2007/Zerox-Store
> **Branch:** main

This workspace is a **multi-vendor e-commerce marketplace** consisting of 4 projects: 1 NestJS backend API and 3 React frontend portals. All frontends communicate with the single backend through a REST API.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack Summary](#tech-stack-summary)
- [1. Backend API (`backend/`)](#1-backend-api-backend)
  - [Core Info](#core-info)
  - [Database & ORM](#database--orm)
  - [Authentication & Authorization](#authentication--authorization)
  - [Feature Modules (24)](#feature-modules-24)
  - [Database Schema (48 tables)](#database-schema-48-tables)
  - [Common Layer](#common-layer)
  - [Background Jobs](#background-jobs)
  - [Seed Data](#seed-data)
  - [API Documentation](#api-documentation)
  - [NPM Scripts](#npm-scripts)
  - [Dependencies](#dependencies)
  - [Test Suite](#test-suite)
  - [Environment Variables](#environment-variables)
- [2. Admin Portal (`frontend/admin-portal/`)](#2-admin-portal-frontendadmin-portal)
  - [Core Info](#core-info-1)
  - [State Management](#state-management)
  - [Routes & Pages (32)](#routes--pages-32)
  - [Component Architecture](#component-architecture)
  - [Test Suite](#test-suite-1)
- [3. Customer Portal (`frontend/customer-portal/`)](#3-customer-portal-frontendcustomer-portal)
  - [Core Info](#core-info-2)
  - [State Management](#state-management-1)
  - [Routes & Pages (26)](#routes--pages-26)
  - [Component Architecture](#component-architecture-1)
  - [Test Suite](#test-suite-2)
- [4. Seller Portal (`frontend/seller-portal/`)](#4-seller-portal-frontendseller-portal)
  - [Core Info](#core-info-3)
  - [State Management](#state-management-2)
  - [Routes & Pages (22)](#routes--pages-22)
  - [Component Architecture](#component-architecture-2)
  - [Test Suite](#test-suite-3)
- [Cross-Project Patterns](#cross-project-patterns)
- [Dev Server Ports](#dev-server-ports)
- [Known Issues & Inconsistencies](#known-issues--inconsistencies)

---

## Architecture Overview

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Admin Portal │   │  Customer    │   │   Seller     │
│  (React 19)  │   │   Portal     │   │   Portal     │
│  Port: 3000  │   │  (React 19)  │   │  (React 19)  │
│              │   │  Port: 3003  │   │  Port: 3002  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │  REST API (/api)
                   ┌──────┴───────┐
                   │  Backend API │
                   │  (NestJS)    │
                   │  Port: 3001  │
                   └──────┬───────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
        ┌─────┴─────┐ ┌──┴──┐ ┌─────┴─────┐
        │ PostgreSQL │ │ R2  │ │  Stripe   │
        │  Database  │ │(S3) │ │ Payments  │
        └───────────┘ └─────┘ └───────────┘
```

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Backend Framework | NestJS 10 + TypeScript |
| Database | PostgreSQL |
| ORM | TypeORM 0.3 |
| Auth | JWT (Passport) + bcrypt |
| File Storage | Cloudflare R2 (S3-compatible) |
| Payments | Stripe |
| Real-time | WebSockets (Socket.IO) |
| Email | Nodemailer |
| Frontend Framework | React 19 + TypeScript |
| Frontend Build | Vite 8 |
| CSS | Tailwind CSS v4 |
| UI Primitives | Radix UI (shadcn-style wrappers) |
| State (server) | TanStack Query v5 |
| State (client) | Zustand v5 |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Icons | Lucide React |
| Toasts | Sonner |
| Routing | React Router v7 |

---

## 1. Backend API (`backend/`)

### Core Info

| Field | Value |
|---|---|
| Package Name | `labverse-api` |
| Version | `0.0.1` |
| Node Engine | ≥ 20 |
| License | UNLICENSED |
| Entry Point | `src/main.ts` |
| Module Count | 24 feature modules |
| Migration Count | 22 migrations |
| Table Count | 48 tables |

### Database & ORM

- **Database:** PostgreSQL with `uuid-ossp` and `pgcrypto` extensions
- **ORM:** TypeORM 0.3 with `SnakeNamingStrategy`
- **Schema sync:** Disabled — migrations are the source of truth
- **SSL:** Optional, controlled via `DB_SSL` env vars
- **Data source config:** `src/config/data-source.ts`

### Authentication & Authorization

- **Strategy:** JWT (access + refresh tokens) via Passport
- **Password hashing:** bcrypt
- **Global guard:** `JwtAuthGuard` is registered globally — all routes are protected by default
- **Public endpoints:** Opt out using `@Public()` decorator
- **Role-based access:** `RolesGuard` — `admin` and `super_admin` bypass role checks
- **Permission-based access:** `PermissionsGuard` — only `super_admin` bypasses, others resolved via raw SQL join across `permissions`, `role_permissions`, and `user_roles`
- **Rate limiting:** Global `ThrottlerGuard`
- **Session management:** Auth sessions and tokens stored in DB

**Auth Endpoints:**
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/change-password`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `POST /auth/verify-email`

### Feature Modules (24)

| # | Module | Description |
|---|---|---|
| 1 | **Auth** | JWT auth, sessions, tokens, login, refresh, password reset, email verification |
| 2 | **Users** | User CRUD, user roles, user addresses |
| 3 | **Roles** | Role CRUD and management |
| 4 | **Permissions** | Permission entities and management |
| 5 | **Role Permissions** | Role-to-permission mapping |
| 6 | **Categories** | Product categories and brands |
| 7 | **Sellers** | Seller profiles with role linkage and notifications |
| 8 | **Products** | Products, variants, images, attributes, product-category pivot (largest catalog module) |
| 9 | **Cart** | Carts, cart items, wishlists, coupons, coupon scopes, flash sales |
| 10 | **Orders** | Orders and order items with notification workflow |
| 11 | **Payments** | Payments and coupon usage tracking |
| 12 | **Returns** | Returns and return items |
| 13 | **Reviews** | Product reviews with seller replies |
| 14 | **Inventory** | Warehouses and inventory records |
| 15 | **Shipping** | Shipping zones, zone countries, methods, shipments, shipment events |
| 16 | **Subscriptions** | Subscription plans and subscriptions |
| 17 | **Notifications** | Notification storage and helper service |
| 18 | **Chat** | Chat threads, participants, messages + WebSocket gateway |
| 19 | **Search** | Saved search queries and product-backed search endpoints |
| 20 | **Audit** | Audit log persistence and audit-log endpoints |
| 21 | **Scheduler** | Background jobs (subscription renewals, expired flash sales, stale orders, cart cleanup) |
| 22 | **Stripe** | Stripe integration for payments, orders, and subscriptions |
| 23 | **Storage** | Global upload module (Cloudflare R2 via S3 APIs) |
| 24 | **Shared** | Shared JWT module registration |

### Database Schema (48 tables)

**Auth & Access (8 tables)**
- `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `auth_sessions`, `auth_tokens`, `user_addresses`

**Catalog (9 tables)**
- `categories`, `brands`, `products`, `attribute_keys`, `attribute_values`, `product_variants`, `variant_attribute_values`, `product_images`, `product_categories`

**Sellers & Stores (2 tables)**
- `sellers`, `stores`

**Cart & Promotions (6 tables)**
- `coupons`, `coupon_scopes`, `wishlists`, `wishlist_items`, `carts`, `cart_items`, `flash_sales`, `flash_sale_items`

**Orders & Payments (4 tables)**
- `orders`, `order_items`, `payments`, `coupon_usages`

**Subscriptions (2 tables)**
- `subscription_plans`, `subscriptions`

**Returns & Reviews (3 tables)**
- `returns`, `return_items`, `reviews`

**Logistics (6 tables)**
- `warehouses`, `inventory`, `shipping_zones`, `shipping_zone_countries`, `shipping_methods`, `shipments`, `shipment_events`

**Communication & Audit (5 tables)**
- `notifications`, `chat_threads`, `chat_thread_participants`, `chat_messages`, `search_queries`, `audit_logs`

### Common Layer

| Category | Details |
|---|---|
| **Decorators** | `@Public()`, `@Roles()`, `@Permissions()`, `@Auditable()` |
| **Guards** | `RolesGuard`, `PermissionsGuard`, ownership helper |
| **Filters** | `GlobalExceptionFilter` — standardizes error responses |
| **Pipes** | `GlobalValidationPipe` — whitelist, forbidNonWhitelisted, transform |
| **Interceptors** | `ResponseInterceptor` (standard envelope), `LoggingInterceptor` (request timing), `AuditInterceptor` (audit trails) |
| **Services** | `StorageService` (R2 uploads), `MailService` (Nodemailer) |
| **Security** | `SecurityUtil` (input sanitization), `EncryptionTransformer` (AES-256-GCM for DB columns) |
| **Utils** | `withRetry` (exponential backoff), `clampLimit`/`clampPage` (pagination), `SafeLogger`, `TokenUtil` |

### Background Jobs

Managed by `SchedulerModule` using `@nestjs/schedule` with PostgreSQL advisory locks for multi-instance safety:

- Subscription renewal processing
- Expired flash sale cleanup
- Stale pending order cancellation
- Guest cart cleanup

### Seed Data

| Script | Purpose |
|---|---|
| `seed:permissions` | Creates 5 system roles + 42 permission modules assigned to super_admin |
| `seed:role-permissions` | Maps scoped permissions to admin, seller, and customer |
| `seed:super-admin` | Creates/updates super admin user (requires env vars) |
| `seed:data` | Seeds 10 categories, 100 products, 500 images (Unsplash-backed) |
| `seed:all` | Runs all seeds in sequence |
| `fix-broken-images` | Tests and replaces broken product image URLs |

### API Documentation

- **Swagger UI:** Available at `/api/docs` (non-production only)
- **Security:** Helmet with restrictive CSP, compression, CORS allowlist via `FRONTEND_URLS`
- **Trust proxy:** Configurable
- **Graceful shutdown:** Enabled

### NPM Scripts

| Script | Command |
|---|---|
| `start:dev` | `nest start --watch` |
| `start:prod` | `node dist/main` |
| `build` | `nest build` |
| `migration:generate` | TypeORM migration generate |
| `migration:run` | TypeORM migration run |
| `migration:revert` | TypeORM migration revert |
| `seed:all` | Run all seeders |
| `db:reset` | Drop + recreate database |
| `test` | Jest unit tests |
| `test:modules` | Integration/module tests |
| `test:e2e` | End-to-end tests |
| `lint` | ESLint with --fix |
| `format` | Prettier formatting |

### Dependencies

**Production (34 packages):**
`@aws-sdk/client-s3`, `@aws-sdk/lib-storage`, `@nestjs/common`, `@nestjs/config`, `@nestjs/core`, `@nestjs/jwt`, `@nestjs/mapped-types`, `@nestjs/passport`, `@nestjs/platform-express`, `@nestjs/platform-socket.io`, `@nestjs/schedule`, `@nestjs/swagger`, `@nestjs/throttler`, `@nestjs/typeorm`, `@nestjs/websockets`, `bcryptjs`, `class-transformer`, `class-validator`, `compression`, `helmet`, `multer`, `nest-winston`, `nodemailer`, `passport`, `passport-jwt`, `pg`, `reflect-metadata`, `rxjs`, `stripe`, `swagger-ui-express`, `typeorm`, `typeorm-naming-strategies`, `uuid`, `winston`

**Dev (23 packages):**
`@nestjs/cli`, `@nestjs/schematics`, `@nestjs/testing`, `@types/*`, `@typescript-eslint/*`, `eslint`, `jest`, `prettier`, `supertest`, `ts-jest`, `ts-node`, `tsconfig-paths`, `typescript`

### Test Suite

| Type | Location | Runner |
|---|---|---|
| Unit tests | `src/**/*.spec.ts` | Jest |
| Integration tests | `test/integration/` | Jest (custom config) |
| E2E tests | `test/app.e2e-spec.ts` | Jest + Supertest |
| Test helpers | `test/utils/` | — |

**Integration specs:** admin-flow, admin-routes, auth-new-features, auth.integration, cart-checkout, customer-flow, customer-routes, seller-flow, seller-routes, superadmin-routes

### Environment Variables

**Required:**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `JWT_SECRET`

**Optional:**
- `JWT_EXPIRES_IN`, `ENCRYPTION_KEY`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (mail)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (payments)
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` (storage)
- `FRONTEND_URLS` (CORS allowlist)
- `THROTTLE_TTL`, `THROTTLE_LIMIT` (rate limiting)
- `PORT`, `NODE_ENV`
- `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` (for seeding)

---

## 2. Admin Portal (`frontend/admin-portal/`)

### Core Info

| Field | Value |
|---|---|
| Package Name | `admin-portal` |
| Version | `0.0.0` |
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 8 |
| Dev Port | 3000 |
| API Proxy | `/api` → `localhost:3001` |
| Page Count | 32 routes |
| Component Count | 22 UI primitives + 16 shared + 3 layout |

### State Management

| Scope | Tool | Details |
|---|---|---|
| Server state | TanStack Query | 30s stale time, selective retries |
| Auth state | Zustand (persisted) | User, tokens, isAuthenticated |
| Theme state | Zustand (persisted) | Light/dark mode, accent color |
| Form state | React Hook Form + Zod | Per-page, typed resolver |

**Auth Flow:**
- JWT login → stored in Zustand + localStorage
- Axios interceptor injects Bearer token
- Auto-refresh on 401 (one retry)
- Session expired → clear store → redirect to `/login`
- 30-minute idle timeout via `useSessionTimeout` hook

### Routes & Pages (32)

**Public Routes:**
| Route | Page |
|---|---|
| `/login` | Login form |
| `/forgot-password` | Password reset request |
| `/reset-password` | Token-based password reset |
| `/unauthorized` | 401 page |

**Protected Routes (role-aware):**
| Route | Page | Access |
|---|---|---|
| `/` | Dashboard (KPIs, charts, recent orders) | All roles |
| `/users` | User CRUD + role assignment | Admin only |
| `/roles` | Role management | Admin only |
| `/permissions` | Permission management | Admin only |
| `/role-permissions` | Permission matrix | Admin only |
| `/categories` | Category CRUD | All roles |
| `/brands` | Brand CRUD | All roles |
| `/sellers` | Seller management + approval | All roles |
| `/stores` | Store CRUD | All roles |
| `/products` | Product management (variants, images, attributes) | All roles |
| `/orders` | Order management + status updates | All roles |
| `/payments` | Payment listing + status | Admin only |
| `/coupons` | Coupon CRUD + scoping | All roles |
| `/flash-sales` | Flash sale management | All roles |
| `/inventory` | Warehouse + stock management | All roles |
| `/shipping` | Zones, methods, shipments | All roles |
| `/subscriptions` | Plans + active subscriptions | All roles |
| `/returns` | Return management | Management roles |
| `/reviews` | Review moderation | All roles |
| `/notifications` | Notification inbox | All roles |
| `/chat` | Chat threads + messaging | All roles |
| `/audit` | Audit log viewer | Admin only |
| `/search-analytics` | Search query analytics | Admin only |
| `/settings` | Profile, password, theme | All roles |
| `/forbidden` | 403 page | All roles |
| `/*` | 404 fallback | All roles |

**Sidebar Navigation Groups:** Overview, Access Control, Catalog, Marketplace, Commerce, Engagement, System

### Component Architecture

**UI Primitives (22):** AlertDialog, Avatar, Badge, Button, Card, Checkbox, Dialog, DropdownMenu, Input, Label, Progress, ScrollArea, Select, Separator, Sheet, Skeleton, Switch, Table, Tabs, Textarea, Tooltip

**Shared Components (16):** Animated, Breadcrumbs, ConfirmDialog, DataTable, EmptyState, ErrorBoundary, FileUploader, Loading, PageHeader, StatCard, StatusBadge, UrlFileField, VirtualizedList

**Layout (3):** AppLayout, Header, Sidebar

**Key Patterns:**
- DataTable is the backbone — sorting, pagination, row selection, bulk actions, CSV/Excel/PDF export
- CRUD pages follow a consistent recipe: useQuery + useMutation + invalidateQueries + toast
- ConfirmDialog for destructive actions
- Lazy-loaded routes with Suspense

### Test Suite

| Type | Tool | Coverage |
|---|---|---|
| Unit/Component | Vitest + Testing Library + MSW | Auth store, theme store, session timeout, utils, button, breadcrumbs, data table, status badge, RBAC, login, error pages |
| E2E | Playwright | 25 spec files covering auth, navigation, cross-cutting, and all major pages |

---

## 3. Customer Portal (`frontend/customer-portal/`)

### Core Info

| Field | Value |
|---|---|
| Package Name | `customer-portal` |
| Version | `1.0.0` |
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 8 |
| Dev Port | 3003 |
| API Proxy | `/api` → `localhost:3001` |
| Page Count | 23 page components / 26 routes |
| Component Count | 70 reusable components |
| Hooks | 9 custom hooks |

### State Management

| Scope | Tool | Details |
|---|---|---|
| Server state | TanStack Query (configured but mostly unused) | Only used in ChatPage |
| Auth state | Zustand (persisted as `customer-auth`) | User, tokens |
| Cart state | Zustand (persisted) | Cart items, quantities |
| UI state | Zustand (persisted) | UI preferences |
| Data fetching | Custom hooks with `useEffect` + `useState` | Most pages use this pattern instead of React Query |

**Auth Flow:** Same JWT pattern as admin portal — Axios interceptor, auto-refresh on 401, logout on failure.

### Routes & Pages (26)

**Public Routes:**
| Route | Page |
|---|---|
| `/` | Homepage — hero carousel, categories, flash sales, featured products, brands |
| `/products` | Product listing — grid/list toggle, filters, sort, pagination |
| `/products/:slug` | Product detail — gallery, variants, pricing, add to cart, reviews |
| `/search` | Search results (reuses product listing) |
| `/categories/:slug` | Category listing |
| `/brands/:slug` | Brand listing |
| `/stores/:slug` | Store page — banner, metadata, products |
| `/flash-sales` | Active flash sales with countdown timers |
| `/cart` | Cart — line items, coupon input, summary |

**Auth Routes:**
| Route | Page |
|---|---|
| `/login` | Email/password login |
| `/register` | Account creation |
| `/forgot-password` | Reset request |
| `/reset-password` | Token-based reset |
| `/verify-email` | Email verification |

**Protected Account Routes (`/account/*`):**
| Route | Page |
|---|---|
| `/account/profile` | Profile editing + avatar upload |
| `/account/orders` | Order history with status filter |
| `/account/orders/:id` | Order detail — items, tracking, invoice, cancel |
| `/account/addresses` | Address CRUD |
| `/account/wishlist` | Wishlist management |
| `/account/notifications` | Notification inbox |
| `/account/reviews` | User's reviews |
| `/account/returns` | Return history + request form |
| `/account/settings` | Password change + account deletion |
| `/account/chat` | Support chat threads |

**Checkout Routes (Protected):**
| Route | Page |
|---|---|
| `/checkout` | 4-step checkout (address → shipping → payment → review) |
| `/checkout/confirmation` | Order confirmation |

### Component Architecture

**Layout (10):** MainLayout, Header, CategoryNav, MegaMenu, MobileMenu, Footer, TopBar, AccountLayout, AuthLayout, CheckoutLayout

**Product (12):** ProductCard, ProductGrid, ProductListItem, ImageGallery, VariantSelector, FilterSidebar, SortDropdown, ActiveFilters, ProductCarousel, ReviewCard, ReviewForm, ReviewSummary

**Cart (5):** CartItem, CartItemRow, CartSummary, CouponInput, EmptyCart

**Checkout (5):** AddressStep, ShippingStep, PaymentStep, ReviewStep, StepIndicator

**Order (4):** OrderCard, TrackingTimeline, ReturnForm, InvoiceButton

**Home (7):** HeroBanner, CategoryStrip, FlashSaleSection, FeaturedSection, PromoBannerRow, BrandStrip, AppDownloadBanner

**Common (9):** Breadcrumb, CountdownTimer, EmptyState, ErrorBoundary, LoadingSpinner, PriceDisplay, QuantitySelector, SEOHead, StarRating

**UI Primitives (18):** AlertDialog, Avatar, Badge, Button, Checkbox, Dialog, DropdownMenu, Input, Label, Progress, ScrollArea, Select, Separator, Sheet, Skeleton, Tabs, Textarea, Tooltip

**Custom Hooks (9):** `useAuth`, `useCart`, `useNotifications`, `useOrders`, `useProducts`, `useRecentlyViewed`, `useReviews`, `useSearch`, `useWishlist`

### Test Suite

- Vitest is configured with jsdom and setup file
- **No actual test specs exist yet** — only the setup file is present

---

## 4. Seller Portal (`frontend/seller-portal/`)

### Core Info

| Field | Value |
|---|---|
| Package Name | `seller-portal` |
| Version | `0.0.0` |
| Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 8 |
| Dev Port | 3002 |
| API Proxy | `/api` → `localhost:3001` |
| Page Count | 22 routes / 21 page components |
| Component Count | 37 reusable components |
| Hooks | 2 custom hooks |

### State Management

| Scope | Tool | Details |
|---|---|---|
| Server state | TanStack Query | 30s stale time |
| Auth state | Zustand (persisted as `seller-auth`) | User, tokens |
| Theme state | Zustand (persisted as `seller-theme`) | Theme, accent, sidebar state |

**Seller Scoping:** The `useSellerProfile` hook resolves the current seller and store, used across dashboard, products, inventory, orders, earnings, analytics, and store settings.

### Routes & Pages (22)

**Auth Routes:**
| Route | Page |
|---|---|
| `/login` | Seller login with role validation |
| `/register` | Seller account creation |
| `/forgot-password` | Password reset request |
| `/reset-password` | Token-based reset |

**Protected Routes (seller, admin, super_admin):**
| Route | Page |
|---|---|
| `/onboarding` | 4-step seller setup (business info → store setup → branding → completion) |
| `/` | Dashboard — stats, revenue chart, recent orders, low-stock alerts |
| `/products` | Product catalog — create, edit, delete, variants, images, export |
| `/products/:id` | Redirects to products (inline editing) |
| `/inventory` | Stock management — levels, update dialog |
| `/orders` | Order list with export |
| `/orders/:id` | Order detail — shipment creation, event tracking, cancellation |
| `/returns` | Returns table with detail sheet |
| `/earnings` | Revenue stats, payout stats, monthly charts, payment list |
| `/reviews` | Review stats, table, seller reply workflow |
| `/chat` | Seller-customer messaging |
| `/notifications` | Notification inbox |
| `/subscriptions` | Subscription management |
| `/settings/store` | Store profile settings |
| `/settings/account` | Account settings + password change |
| `/analytics` | Date-range analytics — revenue, orders, AOV, product counts |
| `/unauthorized` | Access denied page |
| `/*` | 404 fallback |

**Sidebar Navigation Groups:** Overview, Catalog, Sales, Finance, Engagement, Settings

### Component Architecture

**Layout (4):** AppLayout, AuthLayout, Header, Sidebar

**Shared (12):** Breadcrumbs, ConfirmDialog, DataTable, EmptyState, ErrorBoundary, FileUploader, Loading, PageHeader, Skeletons, StatCard, StatusBadge, UrlFileField

**UI Primitives (21):** AlertDialog, Avatar, Badge, Button, Card, Checkbox, Dialog, DropdownMenu, Input, Label, Progress, ScrollArea, Select, Separator, Sheet, Skeleton, Switch, Table, Tabs, Textarea, Tooltip

### Test Suite

| Type | Files |
|---|---|
| Unit tests | `button.test.tsx`, `breadcrumbs.test.tsx`, `data-table.test.tsx`, `status-badge.test.tsx`, `utils.test.ts` |
| E2E | None (manual TESTING_CHECKLIST.md exists) |

---

## Cross-Project Patterns

### Shared Across All Frontends

1. **Same UI component library** — Radix UI primitives with local shadcn-style wrappers (Button, Dialog, Select, etc.)
2. **Same design token approach** — CSS variables for light/dark themes in `index.css`
3. **Same auth flow** — JWT login → Zustand persist → Axios interceptor → auto-refresh → logout
4. **Same API client pattern** — Axios instance with Bearer injection, envelope unwrapping, 401 refresh
5. **Same form stack** — React Hook Form + Zod + @hookform/resolvers
6. **Same table component** — DataTable (admin + seller) with TanStack Table, export support
7. **Same routing pattern** — React Router v7 + lazy-loaded routes + Suspense

### API Service Organization

All three frontends consolidate their API calls into a single `services/api.ts` file with domain-grouped service objects matching backend modules.

### Export Capabilities

Admin and Seller portals support CSV, Excel (xlsx), and PDF (jspdf) exports from data tables.

---

## Dev Server Ports

| Project | Port | API Proxy Target |
|---|---|---|
| Backend API | 3001 | — |
| Admin Portal | 3000 | `localhost:3001` |
| Seller Portal | 3002 | `localhost:3001` |
| Customer Portal | 3003 | `localhost:3001` |

---

## Known Issues & Inconsistencies

### Backend
1. **Stale README** — Parts of `backend/README.md` describe a 35-migration, 34-module platform that doesn't exist; actual count is 22 migrations and 24 modules
2. **README claims JwtAuthGuard is per-controller** — but `app.module.ts` registers it globally
3. **README says admin bypasses PermissionsGuard** — code only bypasses `super_admin`
4. **Column name drift** — `scheduler.service.ts` references `end_date` on flash_sales, but the migration defines `ends_at`
5. **Permissions decorator unused** — `@Permissions()` decorator exists but no controller uses it; authorization is effectively role-based only

### Customer Portal
6. **Category/Brand slug routes broken** — Routes declare slug params but `ProductListingPage` reads `categoryId`/`brandId` from query params instead
7. **Search param mismatch** — Header search navigates to `/search?q=...` but listing page reads `search=...`
8. **Chat page data shape mismatch** — `ChatPage` expects nested data envelope but `chatApi.listThreads` returns flat array
9. **React Query underused** — Configured globally but only used in ChatPage; all other data fetching uses `useEffect` + `useState`
10. **No test specs** — Vitest is configured but zero test files exist

### Seller Portal
11. **ThemeProvider stale reference** — `ThemeProvider.tsx` reads `admin-theme` key instead of `seller-theme` (copy-paste from admin)
12. **Orders search not wired** — Search state exists but query function doesn't pass it to the API
13. **Default Vite favicon** — HTML shell still uses the Vite scaffold favicon

### Admin Portal
14. **Header global search is presentational** — Search input exists but has no wired backend behavior

---

## File Statistics

| Project | Source Files (approx) | Lines of Code (est) |
|---|---|---|
| Backend | ~180+ TS files | Large — 24 modules with entities, services, controllers |
| Admin Portal | ~85 TSX/TS files | 32 pages + 41 components + services/stores |
| Customer Portal | ~100 TSX/TS files | 23 pages + 70 components + 9 hooks |
| Seller Portal | ~65 TSX/TS files | 21 pages + 37 components + 2 hooks |
| **Total** | **~430+ files** | — |
