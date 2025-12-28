# Server

This directory contains the backend API for the ARG Tour & Travel Finance Dashboard.

## Tech Stack

- **Express.js** - Web framework
- **DrizzleORM** - Type-safe ORM
- **PostgreSQL** - Database
- **Better Auth** - Authentication
- **Zod** - Validation
- **TypeScript** - Type safety

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL with Docker Compose

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove data
docker-compose down -v
```

**Services:**
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050` (admin@argtour.com / admin123)

### 3. Set up environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

The default `.env.example` is pre-configured for Docker Compose. No changes needed for local development.

### 4. Generate and run migrations

```bash
# Generate migrations from schema
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

### 5. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`.

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check API status

### Authentication
All routes under `/api/v1/auth` are handled by Better Auth:
- `POST /api/v1/auth/sign-in/email` - Login with email/password
- `POST /api/v1/auth/sign-out` - Logout
- `GET /api/v1/auth/session` - Get current session

### Dashboard
- `GET /api/v1/dashboard/overview` - Get complete dashboard data
- `GET /api/v1/dashboard/metrics` - Get main metrics
- `GET /api/v1/dashboard/cashflow` - Get cashflow chart data
- `GET /api/v1/dashboard/manifest-status` - Get seat distribution
- `GET /api/v1/dashboard/recent-transactions` - Get recent transactions

### Packages (Paket)
- `GET /api/v1/paket` - List all packages
- `GET /api/v1/paket/:id` - Get package details
- `POST /api/v1/paket` - Create package
- `PUT /api/v1/paket/:id` - Update package
- `DELETE /api/v1/paket/:id` - Delete package

### Jamaah
- `GET /api/v1/jamaah` - List all jamaah
- `GET /api/v1/jamaah/:id` - Get jamaah details
- `POST /api/v1/jamaah` - Create jamaah
- `PUT /api/v1/jamaah/:id` - Update jamaah
- `DELETE /api/v1/jamaah/:id` - Delete jamaah
- `GET /api/v1/jamaah/unpaid` - Get jamaah with outstanding balance

### Transactions (Keuangan)
- `GET /api/v1/keuangan/cashflow` - Get cashflow summary
- `GET /api/v1/keuangan/pemasukan` - List income transactions
- `POST /api/v1/keuangan/pemasukan` - Create income
- `GET /api/v1/keuangan/pengeluaran` - List expense transactions
- `POST /api/v1/keuangan/pengeluaran` - Create expense
- `DELETE /api/v1/keuangan/:id` - Delete transaction

### Vendors
- `GET /api/v1/vendor` - List all vendors
- `GET /api/v1/vendor/:id` - Get vendor details
- `POST /api/v1/vendor` - Create vendor
- `PUT /api/v1/vendor/:id` - Update vendor
- `DELETE /api/v1/vendor/:id` - Delete vendor
- `GET /api/v1/vendor/hutang` - List vendor debts
- `POST /api/v1/vendor/hutang` - Create vendor debt
- `POST /api/v1/vendor/hutang/:id/pay` - Add payment to debt

### Reports (Laporan)
- `GET /api/v1/laporan/audit` - Get audit logs
- `GET /api/v1/laporan/laba-rugi` - P&L report
- `GET /api/v1/laporan/budget-actual` - Budget vs Actual report

## User Roles

- **Owner** - Full access to all features
- **Finance** - Access to financial data and reports
- **Admin** - Access to operational data (jamaah, packages)

## Database Schema

View `src/db/schema/` for complete schema definitions:

- `users.ts` - User authentication tables
- `packages.ts` - Tour packages
- `jamaah.ts` - Pilgrim data
- `transactions.ts` - Financial transactions
- `vendors.ts` - Vendor management
- `invoices.ts` - Invoice generation
- `auditLogs.ts` - Audit trail

## Development

### Drizzle Studio

To view and manage your database visually:

```bash
npm run db:studio
```

### Build for production

```bash
npm run build
npm start
```
