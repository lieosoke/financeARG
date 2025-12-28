# Product Specification Document
## Finance-ARG: Umrah & Haji Management System

**Version:** 1.0  
**Date:** December 28, 2025  
**Document Status:** Final Draft

---

## 1. Executive Summary

### 1.1 Product Overview
Finance-ARG is a comprehensive web-based management system designed for Umrah and Haji travel agencies. The system manages pilgrim (jamaah) registration, package management, financial transactions, vendor relationships, and reporting for religious pilgrimage operations.

### 1.2 Target Users
- **Travel Agency Owners**: Full system access and control
- **Finance Managers**: Financial transaction management and reporting
- **Admin Staff**: Jamaah and package management
- **General Users**: Limited access based on role permissions

### 1.3 Key Business Value
- Streamlined jamaah registration and management
- Comprehensive financial tracking (income, expenses, debts)
- Automated payment status monitoring
- Package capacity and seat management
- Vendor debt tracking
- Real-time financial reporting and analytics

---

## 2. System Architecture

### 2.1 Technology Stack

#### Frontend
- **Framework**: React 19.2.0 with Vite
- **Routing**: React Router DOM 7.11.0
- **State Management**: Zustand 5.0.9
- **Data Fetching**: TanStack React Query 5.90.12
- **Forms**: React Hook Form 7.69.0 with Zod validation
- **UI Components**: Lucide React for icons
- **Styling**: Tailwind CSS 3.4.19
- **Charts**: Recharts 3.6.0
- **PDF Generation**: jsPDF 3.0.4, html2canvas 1.4.1
- **Notifications**: React Hot Toast 2.6.0

#### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: Better Auth 1.4.8
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod 4.2.1

### 2.2 Application Structure

```
finance-arg/
├── src/                    # Frontend application
│   ├── pages/             # Page components
│   │   ├── auth/          # Authentication pages
│   │   ├── dashboard/     # Dashboard
│   │   ├── jamaah/        # Pilgrim management
│   │   ├── paket/         # Package management
│   │   ├── keuangan/      # Financial management
│   │   ├── laporan/       # Reports
│   │   ├── vendor/        # Vendor management
│   │   ├── settings/      # System settings
│   │   ├── profile/       # User profile
│   │   └── notifications/ # Notifications
│   ├── components/        # Reusable components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API services
│   ├── contexts/          # React contexts
│   └── utils/             # Utility functions
└── server/                # Backend application
    └── src/
        ├── routes/        # API routes
        ├── services/      # Business logic
        ├── middleware/    # Auth, RBAC, validation
        ├── db/            # Database schemas & migrations
        └── config/        # Configuration
```

---

## 3. Core Features & Functionality

### 3.1 Authentication & Authorization

#### User Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| **Owner** | Travel agency owner | Full system access, user management, all CRUD operations |
| **Finance** | Finance manager | Financial transactions, reports, vendor management |
| **Admin** | Administrative staff | Jamaah and package management |
| **User** | General user | Limited read access |

#### Authentication Features
- Email/password authentication (Better Auth)
- Session management
- Role-based access control (RBAC)
- Protected routes with role validation
- Email verification support
- Password reset functionality

---

### 3.2 Dashboard

#### Overview Metrics
- **Total Cash (Total Kas)**: Current cash balance
- **Total Income (Total Pemasukan)**: Aggregate income
- **Total Expenses (Total Pengeluaran)**: Aggregate expenses
- **Active Jamaah Count**: Number of active pilgrims
- **Total Outstanding (Piutang)**: Receivables from jamaah
- **Vendor Debts**: Total payables to vendors

#### Visualizations
- **Cash Flow Chart**: Monthly income vs expenses trend
- **Package Status**: Distribution of packages by status
- **Payment Status**: Jamaah categorized by payment completion

---

### 3.3 Jamaah (Pilgrim) Management

#### Personal Information
```typescript
interface JamaahPersonalInfo {
  // Identity
  title: 'Mr' | 'Mstr' | 'Mrs' | 'Miss' | 'Infant'
  name: string
  nik: string                    // National ID (KTP)
  passportNumber: string
  passportExpiry: Date
  gender: 'male' | 'female'
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed'
  dateOfBirth: Date
  placeOfBirth: string
  
  // Calculated field
  age: number                    // Auto-calculated from dateOfBirth
  
  // Contact
  phone: string
  email: string
  address: string
  
  // Emergency Contact
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelation: string
}
```

#### Package Assignment
- Package selection (Umrah/Haji)
- Seat number assignment
- Room assignment:
  - Room type: Single, Double, Triple, Quad, Queen
  - Room number
  - Room mate assignment

#### Payment Tracking
```typescript
interface JamaahPayment {
  totalAmount: decimal(15,2)      // Package price
  paidAmount: decimal(15,2)       // Total paid
  remainingAmount: decimal(15,2)  // Outstanding balance
  paymentStatus: 'pending' | 'dp' | 'cicilan' | 'lunas' | 'dibatalkan'
}
```

#### Document Management
- Photo upload
- Passport scan
- KTP (National ID) scan

#### API Endpoints
- `GET /jamaah` - List all jamaah with filters
- `GET /jamaah/:id` - Get jamaah details with package info
- `GET /jamaah/unpaid` - Get jamaah with outstanding balance
- `GET /jamaah/stats` - Statistics (count by status, piutang, active count)
- `POST /jamaah` - Create new jamaah (admin/owner)
- `PUT /jamaah/:id` - Update jamaah (admin/owner)
- `PUT /jamaah/bulk-update` - Bulk update multiple jamaah
- `DELETE /jamaah/:id` - Soft delete jamaah (owner only)

#### Filtering & Search
- Package ID filter
- Payment status filter
- Active/inactive filter
- Full-text search (name, NIK, passport)
- Pagination support

---

### 3.4 Package Management

#### Package Information
```typescript
interface Package {
  code: string                    // Unique code (e.g., UMR-01, HJI-2024-01)
  name: string
  type: 'umroh' | 'haji'
  description: string
  
  // Pricing
  pricePerPerson: decimal(15,2)
  
  // Capacity
  totalSeats: number
  bookedSeats: number             // Auto-calculated
  
  // Schedule
  departureDate: Date
  returnDate: Date
  
  // Status
  status: 'open' | 'closed' | 'ongoing' | 'completed'
  
  // Budget
  estimatedCost: decimal(15,2)
  actualCost: decimal(15,2)
  
  // Details
  hotelMakkah: string
  hotelMadinah: string
  airline: string
}
```

#### Features
- Create, read, update, delete packages
- Duplicate code validation
- Package summary with occupancy statistics
- Seat availability tracking
- Budget vs actual cost tracking

#### API Endpoints
- `GET /paket` - List packages with filters
- `GET /paket/:id` - Get package details
- `GET /paket/:id/summary` - Get package summary with occupancy
- `POST /paket` - Create package (admin/owner)
- `PUT /paket/:id` - Update package (admin/owner)
- `DELETE /paket/:id` - Delete package (owner only)

---

### 3.5 Manifest & Seat Management

#### Manifest Features
- View all jamaah assigned to a package
- Filter by payment status (Lunas/Belum Lunas)
- Print manifest
- Download manifest as PDF
- Display seat assignments

#### Seat Control
- Visual seat map
- Seat assignment interface
- Package selection filter
- Real-time seat availability

#### Room List Management
- Room assignment by package
- Room type categorization
- Room mate pairing
- Package-specific room lists

---

### 3.6 Financial Management (Keuangan)

#### 3.6.1 Income Transactions (Pemasukan)

```typescript
interface IncomeTransaction {
  type: 'pemasukan'
  incomeCategory: 'dp' | 'cicilan' | 'pelunasan' | 'lainnya'
  amount: decimal(15,2)
  jamaahId: string               // Link to pilgrim
  packageId: string
  paymentMethod: PaymentMethod
  referenceNumber: string        // Receipt/transfer number
  bankName: string
  description: string
  notes: string
  transactionDate: Date
  receiptUrl: string             // Receipt attachment
}
```

**Income Categories:**
- **DP (Down Payment)**: Initial deposit
- **Cicilan**: Installment payment
- **Pelunasan**: Final payment
- **Lainnya**: Other income

**Features:**
- Record income from jamaah payments
- Automatic jamaah payment status update
- Payment method tracking
- Receipt upload
- Transaction history

#### 3.6.2 Expense Transactions (Pengeluaran)

```typescript
interface ExpenseTransaction {
  type: 'pengeluaran'
  expenseCategory: ExpenseCategory
  amount: decimal(15,2)
  vendorId: string               // Link to vendor
  packageId: string
  paymentMethod: PaymentMethod
  referenceNumber: string
  bankName: string
  description: string
  notes: string
  transactionDate: Date
  receiptUrl: string
}
```

**Expense Categories:**
- **Tiket Pesawat**: Flight tickets
- **Hotel**: Hotel accommodations
- **Transport**: Local transportation
- **Visa Handling**: Visa processing
- **Muthawif**: Religious guide services
- **Konsumsi**: Meals and consumables
- **Lainnya**: Other expenses

**Features:**
- Record expenses to vendors
- Package-specific expense tracking
- Category-based classification
- Receipt attachment

#### 3.6.3 Payment Methods
- Bank BCA
- Bank Mandiri
- Bank BNI
- Bank BRI
- Bank Syariah
- Cash
- Transfer

#### 3.6.4 Cashflow Management

**Features:**
- Monthly cashflow visualization
- Income vs expense comparison
- Date range filtering
- Trend analysis (default: 6 months)

**API Endpoints:**
- `GET /keuangan/cashflow` - Monthly cashflow data
- `GET /keuangan/totals` - Total income and expenses
- `GET /keuangan/pemasukan` - List income transactions
- `POST /keuangan/pemasukan` - Create income (finance/owner)
- `GET /keuangan/pengeluaran` - List expense transactions
- `POST /keuangan/pengeluaran` - Create expense (finance/owner)
- `GET /keuangan/:id` - Get transaction details
- `PUT /keuangan/:id` - Update transaction (finance/owner)
- `DELETE /keuangan/:id` - Delete transaction (owner only)

---

### 3.7 Vendor Debt Management (Hutang Vendor)

#### Vendor Debt Structure
```typescript
interface VendorDebt {
  id: string
  vendorId: string               // Link to vendor
  packageId: string
  description: string            // Debt description
  totalAmount: decimal(15,2)
  paidAmount: decimal(15,2)
  remainingAmount: decimal(15,2)
  dueDate: Date
  status: 'unpaid' | 'partial' | 'paid'
  notes: string
}
```

#### Features
- Create vendor debts
- Record debt payments
- Automatic status calculation
- Due date tracking
- Outstanding balance reporting

#### API Endpoints
- `GET /vendor/debts` - List vendor debts
- `POST /vendor/debts` - Create new debt (finance/owner)
- `POST /vendor/debts/:id/payment` - Record payment (finance/owner)
- `GET /vendor/debts/summary` - Debt summary statistics

---

### 3.8 Vendor Management

#### Vendor Information
```typescript
interface Vendor {
  id: string
  name: string
  type: string                   // airline, hotel, transport, visa, muthawif, etc.
  contactPerson: string
  phone: string
  email: string
  address: string
  
  // Banking details
  bankAccount: string
  bankName: string
  bankAccountHolder: string
  npwp: string                   // Tax ID
  
  notes: string
  isActive: boolean
}
```

#### Features
- Create, read, update, delete vendors
- Vendor categorization by type
- Banking information storage
- Active/inactive status management
- Vendor selection in expense transactions

#### API Endpoints
- `GET /vendor` - List vendors
- `GET /vendor/:id` - Get vendor details
- `POST /vendor` - Create vendor (finance/owner)
- `PUT /vendor/:id` - Update vendor (finance/owner)
- `DELETE /vendor/:id` - Delete vendor (owner only)

---

### 3.9 Reporting (Laporan)

#### 3.9.1 Profit & Loss Report (Laba Rugi)
- Income categorization
- Expense categorization
- Net profit calculation
- Date range filtering
- Export capability

#### 3.9.2 Budget vs Actual Report
- Package-wise comparison
- Estimated vs actual costs
- Variance analysis
- Package status filtering

#### 3.9.3 Invoice Generator
- Jamaah-specific invoices
- Payment history display
- Outstanding balance calculation
- Payment status filter (Lunas/Belum Lunas)
- Print functionality
- PDF download

#### 3.9.4 Audit Log
- User activity tracking
- Transaction audit trail
- Change history
- Timestamp and user identification

#### API Endpoints
- `GET /laporan/laba-rugi` - Profit & loss report
- `GET /laporan/budget-actual` - Budget comparison
- `GET /laporan/audit-logs` - Audit logs

---

### 3.10 Settings

#### 3.10.1 User Management (Owner Only)
```typescript
interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image: string
  role: 'owner' | 'finance' | 'admin' | 'user'
  createdAt: Date
  updatedAt: Date
}
```

**Features:**
- Create, read, update, delete users
- Role assignment
- Email verification status
- User activity monitoring

#### 3.10.2 Role & Permissions (Owner Only)
- Define role-based access
- Permission matrix
- Route-level access control

#### 3.10.3 Company Settings (Owner Only)
```typescript
interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  website: string
  logo: string
  taxId: string                  // NPWP
  businessLicense: string
  bankAccounts: BankAccount[]
}
```

**Bank Account Structure:**
```typescript
interface BankAccount {
  bankName: string
  accountNumber: string
  accountHolder: string
  branch: string
}
```

---

### 3.11 User Profile Management

#### Profile Information
- Name and email
- Profile photo
- Password change
- Notification preferences

#### API Endpoints
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update profile
- `PUT /user/change-password` - Change password

---

### 3.12 Notifications

#### Notification Types
- Payment reminders
- Package deadlines
- Vendor payment due dates
- System announcements

#### Features
- Real-time notifications
- Read/unread status
- Notification history
- Mark as read/unread

#### API Endpoints
- `GET /notifications` - List notifications
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

---

## 4. Database Schema

### 4.1 Core Entities

#### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN DEFAULT false,
  name TEXT,
  image TEXT,
  role USER_ROLE DEFAULT 'user' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

#### Jamaah Table
```sql
CREATE TABLE jamaah (
  id TEXT PRIMARY KEY,
  title TITLE_ENUM,
  name TEXT NOT NULL,
  nik TEXT,
  passport_number TEXT,
  passport_expiry TIMESTAMP,
  gender GENDER_ENUM,
  marital_status MARITAL_STATUS_ENUM,
  date_of_birth TIMESTAMP,
  place_of_birth TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  package_id TEXT REFERENCES packages(id),
  seat_number INTEGER,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
  remaining_amount DECIMAL(15,2),
  payment_status PAYMENT_STATUS_ENUM DEFAULT 'pending' NOT NULL,
  room_type ROOM_TYPE_ENUM,
  room_number TEXT,
  room_mate TEXT,
  is_active BOOLEAN DEFAULT true,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  notes TEXT,
  photo_url TEXT,
  passport_scan_url TEXT,
  ktp_scan_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by_id TEXT REFERENCES users(id)
);
```

#### Packages Table
```sql
CREATE TABLE packages (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type PACKAGE_TYPE_ENUM NOT NULL,
  description TEXT,
  price_per_person DECIMAL(15,2) NOT NULL,
  total_seats INTEGER NOT NULL,
  booked_seats INTEGER DEFAULT 0,
  departure_date TIMESTAMP,
  return_date TIMESTAMP,
  status PACKAGE_STATUS_ENUM DEFAULT 'open' NOT NULL,
  estimated_cost DECIMAL(15,2),
  actual_cost DECIMAL(15,2) DEFAULT 0,
  hotel_makkah TEXT,
  hotel_madinah TEXT,
  airline TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by_id TEXT REFERENCES users(id)
);
```

#### Transactions Table
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  type TRANSACTION_TYPE_ENUM NOT NULL,
  income_category INCOME_CATEGORY_ENUM,
  expense_category EXPENSE_CATEGORY_ENUM,
  amount DECIMAL(15,2) NOT NULL,
  package_id TEXT REFERENCES packages(id),
  jamaah_id TEXT REFERENCES jamaah(id),
  vendor_id TEXT REFERENCES vendors(id),
  payment_method PAYMENT_METHOD_ENUM,
  reference_number TEXT,
  bank_name TEXT,
  description TEXT,
  notes TEXT,
  transaction_date TIMESTAMP DEFAULT NOW() NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by_id TEXT REFERENCES users(id) NOT NULL
);
```

#### Vendor Debts Table
```sql
CREATE TABLE vendor_debts (
  id TEXT PRIMARY KEY,
  vendor_id TEXT REFERENCES vendors(id) NOT NULL,
  package_id TEXT REFERENCES packages(id),
  description TEXT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0 NOT NULL,
  remaining_amount DECIMAL(15,2),
  due_date TIMESTAMP,
  status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  created_by_id TEXT REFERENCES users(id)
);
```

#### Vendors Table
```sql
CREATE TABLE vendors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  bank_account TEXT,
  bank_name TEXT,
  bank_account_holder TEXT,
  npwp TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

### 4.2 Enumerations

```typescript
// User roles
enum UserRole { owner, finance, admin, user }

// Payment status
enum PaymentStatus { pending, dp, cicilan, lunas, dibatalkan }

// Gender
enum Gender { male, female }

// Title
enum Title { Mr, Mstr, Mrs, Miss, Infant }

// Marital status
enum MaritalStatus { single, married, divorced, widowed }

// Room type
enum RoomType { single, double, triple, quad, queen }

// Package status
enum PackageStatus { open, closed, ongoing, completed }

// Package type
enum PackageType { umroh, haji }

// Transaction type
enum TransactionType { pemasukan, pengeluaran }

// Income category
enum IncomeCategory { dp, cicilan, pelunasan, lainnya }

// Expense category
enum ExpenseCategory { 
  tiket_pesawat, hotel, transport, visa_handling, 
  muthawif, konsumsi, lainnya 
}

// Payment method
enum PaymentMethod { 
  bank_bca, bank_mandiri, bank_bni, bank_bri, 
  bank_syariah, cash, transfer 
}
```

---

## 5. User Flows

### 5.1 Jamaah Registration Flow
1. Admin/Owner navigates to Jamaah page
2. Clicks "Tambah Jamaah Baru"
3. Fills in personal information form
4. Selects package
5. Enters payment details (total amount)
6. Assigns seat and room (optional)
7. Uploads documents (photo, passport, KTP)
8. Saves jamaah record
9. System creates jamaah with "pending" payment status

### 5.2 Payment Recording Flow
1. Finance/Owner navigates to Keuangan > Pemasukan
2. Clicks "Tambah Pemasukan"
3. Selects jamaah from dropdown
4. Chooses payment category (DP/Cicilan/Pelunasan)
5. Enters amount and payment method
6. Adds reference number and receipt
7. Saves transaction
8. System automatically updates:
   - Jamaah's `paidAmount`
   - Jamaah's `remainingAmount`
   - Jamaah's `paymentStatus`
9. Dashboard totals refresh automatically

### 5.3 Package Creation Flow
1. Admin/Owner navigates to Paket page
2. Clicks "Buat Paket Baru"
3. Enters package code (unique)
4. Fills in package details:
   - Name, type (Umrah/Haji)
   - Price per person
   - Total seats
   - Departure/return dates
   - Hotel and airline information
5. Sets estimated cost
6. Saves package with "open" status
7. Package becomes available for jamaah assignment

### 5.4 Vendor Debt Management Flow
1. Finance/Owner navigates to Keuangan > Hutang Vendor
2. Clicks "Tambah Hutang"
3. Selects vendor
4. Enters debt details:
   - Description
   - Total amount
   - Due date
   - Package association (optional)
5. Saves vendor debt
6. To record payment:
   - Selects debt record
   - Clicks "Catat Pembayaran"
   - Enters payment amount
   - System updates `paidAmount` and `status`

### 5.5 Report Generation Flow
1. User navigates to Laporan section
2. Selects report type
3. Sets filters (date range, package, status, etc.)
4. Clicks "Generate Report"
5. Views report on screen
6. Options:
   - Print report
   - Download as PDF
   - Export data

---

## 6. Security & Permissions

### 6.1 Access Control Matrix

| Feature | Owner | Finance | Admin | User |
|---------|-------|---------|-------|------|
| **Dashboard** | ✓ | ✓ | ✓ | ✓ |
| **Jamaah - View** | ✓ | ✓ | ✓ | ✓ |
| **Jamaah - Create/Edit** | ✓ | ✗ | ✓ | ✗ |
| **Jamaah - Delete** | ✓ | ✗ | ✗ | ✗ |
| **Package - View** | ✓ | ✓ | ✓ | ✓ |
| **Package - Create/Edit** | ✓ | ✗ | ✓ | ✗ |
| **Package - Delete** | ✓ | ✗ | ✗ | ✗ |
| **Keuangan - View** | ✓ | ✓ | ✗ | ✗ |
| **Keuangan - Transactions** | ✓ | ✓ | ✗ | ✗ |
| **Vendor - View** | ✓ | ✓ | ✗ | ✗ |
| **Vendor - Manage** | ✓ | ✓ | ✗ | ✗ |
| **Reports - View** | ✓ | ✓ | ✓ | ✓ |
| **Settings - Users** | ✓ | ✗ | ✗ | ✗ |
| **Settings - Roles** | ✓ | ✗ | ✗ | ✗ |
| **Settings - Company** | ✓ | ✗ | ✗ | ✗ |

### 6.2 Authentication Middleware
- All routes require valid session token
- Token validation on every request
- Automatic session refresh
- Session expiration handling

### 6.3 Role-Based Access Control (RBAC)
- Route-level protection
- API endpoint validation
- Function-level permissions
- Automatic unauthorized access blocking

---

## 7. Data Validation

### 7.1 Frontend Validation (React Hook Form + Zod)
- Real-time field validation
- Type-safe schema validation
- Custom validation rules
- User-friendly error messages

### 7.2 Backend Validation (Zod Schemas)
- Request body validation
- Query parameter validation
- Type coercion and transformation
- Data sanitization
- Duplicate detection

### 7.3 Business Logic Validation
- Unique package codes
- Seat availability checking
- Outstanding balance calculations
- Payment status consistency
- Date range validations

---

## 8. API Documentation

### 8.1 Base URL
```
http://localhost:5000/api
```

### 8.2 Authentication Header
```
Authorization: Bearer <session_token>
```

### 8.3 Response Format
```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: string,
  code: number
}

// Paginated response
{
  success: true,
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### 8.4 Complete API Routes

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/session` - Get current session

#### Dashboard
- `GET /dashboard/summary` - Dashboard overview statistics

#### Jamaah
- `GET /jamaah` - List jamaah (paginated, filterable)
- `GET /jamaah/:id` - Get jamaah by ID
- `GET /jamaah/unpaid` - Jamaah with outstanding balance
- `GET /jamaah/stats` - Jamaah statistics
- `POST /jamaah` - Create jamaah
- `PUT /jamaah/:id` - Update jamaah
- `PUT /jamaah/bulk-update` - Bulk update
- `DELETE /jamaah/:id` - Delete jamaah

#### Packages
- `GET /paket` - List packages
- `GET /paket/:id` - Get package by ID
- `GET /paket/:id/summary` - Package summary
- `POST /paket` - Create package
- `PUT /paket/:id` - Update package
- `DELETE /paket/:id` - Delete package

#### Transactions
- `GET /keuangan/cashflow` - Cashflow data
- `GET /keuangan/totals` - Total income & expenses
- `GET /keuangan/pemasukan` - List income transactions
- `POST /keuangan/pemasukan` - Create income
- `GET /keuangan/pengeluaran` - List expenses
- `POST /keuangan/pengeluaran` - Create expense
- `GET /keuangan/:id` - Get transaction
- `PUT /keuangan/:id` - Update transaction
- `DELETE /keuangan/:id` - Delete transaction

#### Vendors
- `GET /vendor` - List vendors
- `GET /vendor/:id` - Get vendor
- `POST /vendor` - Create vendor
- `PUT /vendor/:id` - Update vendor
- `DELETE /vendor/:id` - Delete vendor
- `GET /vendor/debts` - List vendor debts
- `POST /vendor/debts` - Create debt
- `POST /vendor/debts/:id/payment` - Record payment
- `GET /vendor/debts/summary` - Debt summary

#### Reports
- `GET /laporan/laba-rugi` - Profit & loss report
- `GET /laporan/budget-actual` - Budget vs actual
- `GET /laporan/audit-logs` - Audit logs

#### Users (Owner only)
- `GET /user` - List users
- `GET /user/:id` - Get user
- `POST /user` - Create user
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user
- `GET /user/profile` - Current user profile
- `PUT /user/profile` - Update profile

#### Company Settings (Owner only)
- `GET /company/settings` - Get company settings
- `PUT /company/settings` - Update settings

#### Notifications
- `GET /notifications` - List notifications
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

---

## 9. Features Summary

### Implemented Features ✓
1. ✓ User authentication & authorization
2. ✓ Role-based access control (Owner, Finance, Admin, User)
3. ✓ Dashboard with real-time metrics
4. ✓ Complete Jamaah management (CRUD)
5. ✓ Package management with seat tracking
6. ✓ Income transaction recording
7. ✓ Expense transaction recording
8. ✓ Vendor management
9. ✓ Vendor debt tracking
10. ✓ Cashflow visualization
11. ✓ Manifest generation with PDF export
12. ✓ Invoice generation
13. ✓ Profit & loss reporting
14. ✓ Budget vs actual analysis
15. ✓ Audit logging
16. ✓ User management
17. ✓ Company settings
18. ✓ Profile management
19. ✓ Seat control interface
20. ✓ Room list management
21. ✓ Payment status automation
22. ✓ Document upload (photos, passports, KTP)
23. ✓ Pagination and filtering
24. ✓ Search functionality
25. ✓ Date range filtering

---

## 10. Future Enhancements (Potential Roadmap)

### Phase 2 - Advanced Features
- [ ] SMS/WhatsApp notifications
- [ ] Email notifications for payment reminders
- [ ] Automated payment schedules
- [ ] Mobile application (React Native)
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Export to Excel
- [ ] Batch import (CSV/Excel)
- [ ] Document template customization
- [ ] E-signature integration
- [ ] Calendar integration for departures
- [ ] Task management for staff

### Phase 3 - Integration & Automation
- [ ] Payment gateway integration
- [ ] Accounting software integration (e.g., Accurate, Zahir)
- [ ] Automated bank reconciliation
- [ ] API for third-party integrations
- [ ] WhatsApp Business API integration
- [ ] Automated report scheduling
- [ ] Data backup automation
- [ ] Multi-company support

---

## 11. Technical Requirements

### 11.1 Server Requirements
- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB for application and files
- **Network**: Stable internet connection

### 11.2 Client Requirements
- **Browser**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Screen Resolution**: Minimum 1366x768
- **JavaScript**: Enabled
- **Cookies**: Enabled

### 11.3 Development Environment
- **Package Manager**: npm or pnpm
- **Development Server**: Vite (port 5173)
- **Backend Server**: Express (port 5000)
- **Database**: PostgreSQL with Drizzle ORM

---

## 12. Deployment

### 12.1 Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/financearg

# Better Auth
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:5000

# Application
NODE_ENV=production
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 12.2 Build Process
```bash
# Frontend build
npm run build

# Database migration
cd server && npm run migrate

# Start production server
npm start
```

### 12.3 Recommended Hosting
- **Frontend**: Vercel, Netlify, or static hosting
- **Backend**: VPS, AWS EC2, DigitalOcean, or Heroku
- **Database**: Managed PostgreSQL (AWS RDS, DigitalOcean, Supabase)

---

## 13. Maintenance & Support

### 13.1 Data Backup
- Daily database backups recommended
- Document upload backups
- Transaction log archiving

### 13.2 Monitoring
- Application performance monitoring
- Error tracking and logging
- Database query performance
- User activity monitoring

### 13.3 Updates
- Dependency updates (security patches)
- Feature enhancements
- Bug fixes
- Database migrations

---

## 14. Compliance & Standards

### 14.1 Data Protection
- Secure password storage (hashed)
- Session token encryption
- HTTPS for production
- Input sanitization
- SQL injection prevention
- XSS protection

### 14.2 Indonesian Regulations
- Currency: Indonesian Rupiah (IDR)
- Tax ID (NPWP) support
- KTP (National ID) integration
- Local banking systems support

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Jamaah** | Pilgrim (person going for Umrah or Haji) |
| **Paket** | Travel package (Umrah or Haji) |
| **Keuangan** | Finance/Financial |
| **Pemasukan** | Income/Revenue |
| **Pengeluaran** | Expense/Expenditure |
| **Hutang** | Debt/Payable |
| **Piutang** | Receivable |
| **Laporan** | Report |
| **Laba Rugi** | Profit & Loss |
| **Kas** | Cash |
| **Manifest** | Passenger list |
| **Muthawif** | Religious guide for Umrah/Haji |
| **DP** | Down Payment (Uang Muka) |
| **Cicilan** | Installment |
| **Pelunasan** | Final payment/settlement |
| **Lunas** | Fully paid |
| **Belum Lunas** | Not fully paid |
| **NIK** | National ID Number (Nomor Induk Kependudukan) |
| **KTP** | National ID Card (Kartu Tanda Penduduk) |
| **NPWP** | Tax Identification Number |

---

## 16. Contact & Support

For technical support or feature requests, please contact the development team.

**Document Version:** 1.0  
**Last Updated:** December 28, 2025  
**Prepared By:** Finance-ARG Development Team

---

**End of Product Specification Document**
