# Finance-ARG: Umrah & Haji Management System

Finance-ARG is a comprehensive web-based management system designed for Umrah and Haji travel agencies. The system streamlines pilgrim (jamaah) registration, package management, financial transactions, vendor relationships, and reporting for religious pilgrimage operations.

## 🚀 Key Features

- **📊 Dashboard & Analytics**: Real-time overview of total cash, income, expenses, and pilgrim statistics.
- **🕋 Jamaah Management**: Complete pilgrim lifecycle management from registration to package assignment and document handling.
- **📦 Package Management**: Dynamic creation and monitoring of Umrah and Haji packages, including seat availability and budgeting.
- **💰 Financial Tracking**: Detailed recording of income (DP, installments) and expenses with automatic payment status updates.
- **🤝 Vendor Debt Management**: Track and manage payables to vendors with due date monitoring.
- **📄 Reporting & Documents**: Professional PDF generation for manifests, invoices, and profit/loss reports.
- **🔐 Secure Access**: Role-based access control (Owner, Finance, Admin, User) with secure authentication.

## 🛠️ Technology Stack

### Frontend
- **React 19.2.0** with **Vite**
- **Tailwind CSS** for modern UI styling
- **Zustand** for state management
- **TanStack React Query** for data fetching
- **Lucide React** for iconography
- **Recharts** for data visualization

### Backend
- **Node.js** with **Express**
- **PostgreSQL** with **Drizzle ORM**
- **Better Auth** for secure authentication
- **Zod** for schema validation

## 📂 Project Structure

```text
finance-arg/
├── src/                    # Frontend application
│   ├── pages/             # Page components (Dashboard, Jamaah, Paket, etc.)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   └── services/          # API communication layer
└── server/                # Backend application
    ├── routes/            # API endpoints
    ├── services/          # Business logic
    └── db/                # Database schema and migrations
```

## 🛠️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lieosoke/finance-arg.git
   cd finance-arg
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and server directories based on the provided examples.

4. **Run the application**:
   - **Frontend (Development)**: `npm run dev`
   - **Backend**: `npm start` (inside the server directory)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
