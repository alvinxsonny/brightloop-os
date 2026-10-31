# 🚀 BrightLoop OS — Hackathon 5-6 Hour Master Plan & Checklist

> **Project Name:** BrightLoop OS  
> **Tagline:** The Autonomous Subscription & Recurring Billing Platform for Brightloop Software  
> **Target Completion:** 5 - 6 Hours  

---

## 📌 Progress Tracker Overview

- [x] **Phase 1: Architecture, Data Schema & Instant Seeding** *(0:00 - 0:30)*
- [x] **Phase 2: Auth, Security & Role-Based Access Control (RBAC)** *(0:30 - 1:15)*
- [x] **Phase 3: Product Catalog, Quotation Templates & Subscriptions** *(1:15 - 2:15)*
- [x] **Phase 4: Automated Billing Engine & Invoicing** *(2:15 - 3:15)*
- [ ] **Phase 5: Payment Entry, Receivables & Customer Portal** *(3:15 - 4:00)*
- [ ] **Phase 6: Executive Finance Lead Dashboard (<2s Response)** *(4:00 - 4:40)*
- [ ] **Phase 7: UI Polish, Aesthetics & Hackathon Demo Walkthrough** *(4:40 - 5:30)*

---

## 📋 Detailed Task Checklist

### Phase 1: Architecture, Data Schema & Instant Seeding (30 mins)
- [x] Initialize Next.js project with TypeScript, Tailwind CSS, and Lucide icons.
- [x] Configure Prisma ORM with SQLite for instant local zero-config database.
- [x] Implement database models in `schema.prisma`:
  - [x] `User` (`ADMIN`, `STAFF`, `CUSTOMER`)
  - [x] `Product` & `ProductVariant` (variant surcharge e.g., Odoo +560)
  - [x] `Plan` (frequency: `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`, min qty, flags: `autoClose`, `allowPause`, `allowRenew`)
  - [x] `QuotationTemplate` & `TemplateLine`
  - [x] `Subscription` & `SubscriptionLine` (status: `DRAFT`, `QUOTATION`, `CONFIRMED`, `ACTIVE`, `PAUSED`, `CLOSED`)
  - [x] `Invoice` & `InvoiceLine` (status: `DRAFT`, `CONFIRMED`, `PAID`, `CANCELLED`)
  - [x] `Payment` (method, amount, timestamp, notes)
  - [x] `TaxRule` & `DiscountRule` (fixed/percentage, min purchase, validity dates, usage limit)
- [x] Create seed script (`prisma/seed.ts`) pre-loading:
  - [x] Admin, Staff, and Customer test accounts
  - [x] Products with variants (e.g., base product + Odoo variant)
  - [x] Quotation template, sample active subscriptions, and an overdue invoice
- [x] Run migration and execute seed to verify database state.

---

### Phase 2: Auth, Security & RBAC Guards (45 mins)
- [x] Authentication system (session/JWT cookie with bcrypt).
- [x] Strict password validator on registration:
  - [x] Length > 8 characters
  - [x] At least 1 uppercase letter
  - [x] At least 1 lowercase letter
  - [x] At least 1 special character
- [x] Forgot password / reset password endpoint & UI flow.
- [x] RBAC Middleware & Route Guards:
  - [x] `/admin/*` -> Admin only (staff management, system config)
  - [x] `/app/*` -> Staff & Admin (quotes, subscriptions, billing, payments)
  - [x] `/portal/*` -> Customer only (own subscriptions & invoices)
- [x] Hackathon Demo Role-Switcher widget (1-click switch between Admin, Staff, Customer).

---

### Phase 3: Product Catalog, Quotation Templates & Subscriptions (60 mins)
- [x] **Product & Plan Management UI/APIs:**
  - [x] Product creation with base sales price, cost price, notes.
  - [x] Variant price adjustments (e.g., +560 for Odoo).
  - [x] Plan creation with billing frequency (Daily, Weekly, Monthly, Yearly), min qty, lifecycle flags.
- [x] **Quotation Templates:**
  - [x] Pre-configure plan & product line presets with default validity days.
  - [x] Create new quotation from scratch or pre-filled template.
- [x] **Subscription Lifecycle State Machine:**
  - [x] Unique subscription number generation (`SUB-XXXX`).
  - [x] Status transitions: `Draft` ➔ `Quotation` ➔ `Confirmed` ➔ `Active` ➔ `Closed`.
  - [x] Action buttons for state transitions (Confirm quote, Activate, Pause, Resume, Close).
  - [x] Item lines calculation (Quantity * Price + Variant surcharge).

---

### Phase 4: Automated Billing Engine & Invoicing (60 mins)
- [x] **Automated Billing Engine (`/api/billing/run-cycle`):**
  - [x] Query all active subscriptions with `nextBillingDate <= today`.
  - [x] Auto-generate `Invoice` records with calculated line items.
  - [x] **Idempotency protection:** check billing cycle dates so no subscription is billed twice.
  - [x] Auto-advance subscription's `nextBillingDate` based on plan frequency.
- [x] **Tax & Discount Calculation Engine:**
  - [x] Dynamic tax calculation from admin rules.
  - [x] Discount rule application (percentage/fixed, minimum spend/seat criteria, usage counter increment).
- [x] **Manual & Automated Invoice Actions:**
  - [x] One-click "Trigger Billing Run" simulation button for hackathon judges.
  - [x] Invoice lifecycle: `Draft` ➔ `Confirmed` ➔ `Paid` / `Cancelled`.
  - [x] Print / PDF-friendly clean invoice view.

---

### Phase 5: Payment Entry, Receivables & Customer Portal (45 mins)
- [ ] **Payment Recording:**
  - [ ] Record payment dialog: invoice selection, amount (partial/full), payment method, date, notes.
  - [ ] Auto-update invoice status to `PAID` when fully paid.
  - [ ] Overdue invoice calculation (due date < now && status != PAID).
- [ ] **Customer Self-Service Portal (`/portal`):**
  - [ ] Isolated view: Customer sees only their subscriptions and invoice history.
  - [ ] Self-service actions: pause/renew/cancel (respecting plan lifecycle permissions).

---

### Phase 6: Executive Finance Dashboard (<2s Response) (40 mins)
- [ ] Fast analytics data aggregation API (< 2s performance benchmark).
- [ ] Executive KPI Cards:
  - [ ] **MRR & ARR** (Monthly & Annual Recurring Revenue)
  - [ ] **Active Subscriptions** count & Churn/Pause rates
  - [ ] **Total Revenue Collected** vs **Total Outstanding Receivables**
  - [ ] **Overdue Invoices** alert count & total amount
- [ ] Visual breakdown charts (Revenue breakdown, Plan distribution).
- [ ] Filterable data table (filter by date range, customer, status, plan).

---

### Phase 7: UI Polish, Aesthetics & Hackathon Pitch Demo Script (40 mins)
- [ ] Polish UI with sleek modern styling, consistent badges, clean typography.
- [ ] Add toast alerts for real-time user feedback.
- [ ] Prepare interactive demo walkthrough for hackathon judges:
  1. Show current broken scenario (manual spreadsheet mess).
  2. Register customer with strict password validation.
  3. Admin configures product with variant (+560 Odoo) and plan.
  4. Sales rep turns quote template into active subscription.
  5. Hit "Trigger Billing Day" -> watch invoice generate automatically with tax & discount.
  6. Record payment against invoice.
  7. Open Finance Lead Dashboard -> highlight instant MRR, overdue tracking, and <2s speed.
