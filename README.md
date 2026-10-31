# BrightLoop OS

Subscription management and recurring billing platform for software businesses.

## Features

- **Product & Variant Catalog**: Configurable software products, optional add-ons, and variant surcharges.
- **Quotation Templates**: Reusable quotation pre-fills with automated validity terms and itemized pricing.
- **Subscription Lifecycle**: State machine managing `DRAFT` → `QUOTATION` → `CONFIRMED` → `ACTIVE` → `CLOSED`, with pause/resume and renewal support.
- **Automated Billing Engine**: Idempotent recurring invoice generation based on plan frequencies (`DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY`) with dynamic discount and tax calculations.
- **Invoicing & Payments**: Itemized invoices, payment reconciliation, partial/full balance settlements, and printable tax receipts.
- **Customer Self-Service Portal**: Customers can inspect active subscriptions, trigger pause/resume/renew actions, and download invoices.
- **Finance Dashboard**: Executive analytics covering MRR, ARR, receivables aging buckets, customer ledger, and CSV exports with sub-second response times.
- **Role-Based Access Control**: Strict access boundaries across `ADMIN`, `STAFF`, and `CUSTOMER` with password complexity validation.

## Tech Stack

- **Multi-Currency Support**: Real-time switching across prominent currencies (`USD`, `EUR`, `GBP`, `INR`, `JPY`, `CAD`, `AUD`) throughout all dashboards, invoices, and analytics.
- **Modern UI & Bento Layouts**: Cloudy white and Jade Green palette, background graph grid, heavily blurred floating gradient circles, vertical left-side hover-expand pill navigation, and glassmorphic bento cards.
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Poppins typography, cloudy white & jade green theme, glassmorphism)
- **Database**: SQLite via [Prisma ORM](https://www.prisma.io/)
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/alvinxsonny/brightloop-os.git
cd brightloop-os
npm install
```

### 2. Database Setup & Seeding

```bash
npx prisma db push
npm run db:seed
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

All pre-seeded demo accounts use the password: `Password@123`

| Role | Email | Access Path | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@brightloop.io` | `/admin` | System overview, staff accounts, tax & discount rules |
| **Staff** | `staff@brightloop.io` | `/app` | Catalog, subscriptions, invoices, and finance console |
| **Customer** | `customer@acme.com` | `/portal` | Customer self-service subscriptions and receipts |

## Build & Production Run

```bash
npm run build
npm start
```

