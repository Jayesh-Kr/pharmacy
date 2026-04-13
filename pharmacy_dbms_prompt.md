# Prompt: Build a Full-Stack Pharmacy Database Management System

## Overview

Build a complete full-stack **Pharmacy Database Management System** using:
- **Frontend**: Next.js (with Tailwind CSS)
- **Backend**: Express.js (Node.js REST API)
- **Database**: MySQL

The application should allow pharmacy staff to manage medicines, suppliers, customers, prescriptions, sales, purchases, and inventory. Below are the exact specifications — follow them precisely.

---

---

## SECTION 1: DATABASE

### Database Name
```
pharmacy_db
```

---

### Tables

#### 1. `categories`
Stores medicine categories.

| Column | Type | Constraints |
|---|---|---|
| category_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| category_name | VARCHAR(100) | NOT NULL, UNIQUE |
| description | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

#### 2. `suppliers`
Stores supplier/vendor information.

| Column | Type | Constraints |
|---|---|---|
| supplier_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| supplier_name | VARCHAR(150) | NOT NULL |
| contact_person | VARCHAR(100) | |
| phone | VARCHAR(15) | NOT NULL |
| email | VARCHAR(100) | UNIQUE |
| address | TEXT | |
| city | VARCHAR(100) | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

#### 3. `medicines`
Stores medicine/product details.

| Column | Type | Constraints |
|---|---|---|
| medicine_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| medicine_name | VARCHAR(150) | NOT NULL |
| generic_name | VARCHAR(150) | |
| category_id | INT | FOREIGN KEY → categories(category_id) |
| supplier_id | INT | FOREIGN KEY → suppliers(supplier_id) |
| unit | VARCHAR(50) | e.g., Tablet, Syrup, Capsule |
| purchase_price | DECIMAL(10,2) | NOT NULL |
| selling_price | DECIMAL(10,2) | NOT NULL |
| stock_quantity | INT | DEFAULT 0 |
| reorder_level | INT | DEFAULT 10 |
| expiry_date | DATE | |
| description | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

#### 4. `customers`
Stores customer information.

| Column | Type | Constraints |
|---|---|---|
| customer_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| customer_name | VARCHAR(150) | NOT NULL |
| phone | VARCHAR(15) | NOT NULL |
| email | VARCHAR(100) | |
| address | TEXT | |
| date_of_birth | DATE | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

#### 5. `doctors`
Stores doctor information for prescriptions.

| Column | Type | Constraints |
|---|---|---|
| doctor_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| doctor_name | VARCHAR(150) | NOT NULL |
| specialization | VARCHAR(100) | |
| phone | VARCHAR(15) | |
| license_number | VARCHAR(100) | UNIQUE |

---

#### 6. `prescriptions`
Stores prescriptions linked to customers and doctors.

| Column | Type | Constraints |
|---|---|---|
| prescription_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| customer_id | INT | FOREIGN KEY → customers(customer_id) |
| doctor_id | INT | FOREIGN KEY → doctors(doctor_id) |
| prescription_date | DATE | NOT NULL |
| notes | TEXT | |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

#### 7. `prescription_items`
Items listed in each prescription.

| Column | Type | Constraints |
|---|---|---|
| item_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| prescription_id | INT | FOREIGN KEY → prescriptions(prescription_id) |
| medicine_id | INT | FOREIGN KEY → medicines(medicine_id) |
| dosage | VARCHAR(100) | |
| quantity | INT | NOT NULL |
| duration_days | INT | |

---

#### 8. `sales`
Stores sales/billing transactions.

| Column | Type | Constraints |
|---|---|---|
| sale_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| customer_id | INT | FOREIGN KEY → customers(customer_id) |
| prescription_id | INT | FOREIGN KEY → prescriptions(prescription_id), NULLABLE |
| sale_date | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| total_amount | DECIMAL(10,2) | NOT NULL |
| discount | DECIMAL(10,2) | DEFAULT 0 |
| paid_amount | DECIMAL(10,2) | NOT NULL |
| payment_method | ENUM('Cash','Card','UPI','Insurance') | DEFAULT 'Cash' |
| created_by | VARCHAR(100) | |

---

#### 9. `sale_items`
Line items for each sale.

| Column | Type | Constraints |
|---|---|---|
| sale_item_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| sale_id | INT | FOREIGN KEY → sales(sale_id) |
| medicine_id | INT | FOREIGN KEY → medicines(medicine_id) |
| quantity | INT | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |
| subtotal | DECIMAL(10,2) | NOT NULL |

---

#### 10. `purchases`
Stores purchase orders from suppliers.

| Column | Type | Constraints |
|---|---|---|
| purchase_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| supplier_id | INT | FOREIGN KEY → suppliers(supplier_id) |
| purchase_date | DATETIME | DEFAULT CURRENT_TIMESTAMP |
| total_amount | DECIMAL(10,2) | NOT NULL |
| invoice_number | VARCHAR(100) | UNIQUE |
| status | ENUM('Pending','Received','Cancelled') | DEFAULT 'Pending' |
| created_by | VARCHAR(100) | |

---

#### 11. `purchase_items`
Line items for each purchase order.

| Column | Type | Constraints |
|---|---|---|
| purchase_item_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| purchase_id | INT | FOREIGN KEY → purchases(purchase_id) |
| medicine_id | INT | FOREIGN KEY → medicines(medicine_id) |
| quantity | INT | NOT NULL |
| unit_price | DECIMAL(10,2) | NOT NULL |
| subtotal | DECIMAL(10,2) | NOT NULL |
| expiry_date | DATE | |

---

#### 12. `users`
Stores system users (admin, pharmacist, cashier).

| Column | Type | Constraints |
|---|---|---|
| user_id | INT | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(100) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(150) | NOT NULL |
| role | ENUM('admin','pharmacist','cashier') | DEFAULT 'cashier' |
| email | VARCHAR(100) | UNIQUE |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

---

### Key SQL Queries to Implement

**1. Get all medicines with low stock (below reorder level):**
```sql
SELECT m.medicine_name, m.stock_quantity, m.reorder_level, s.supplier_name
FROM medicines m
JOIN suppliers s ON m.supplier_id = s.supplier_id
WHERE m.stock_quantity <= m.reorder_level;
```

**2. Get medicines expiring within the next 30 days:**
```sql
SELECT medicine_name, expiry_date, stock_quantity
FROM medicines
WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY);
```

**3. Get total sales revenue grouped by day:**
```sql
SELECT DATE(sale_date) AS sale_day, SUM(total_amount) AS revenue, COUNT(*) AS total_sales
FROM sales
GROUP BY DATE(sale_date)
ORDER BY sale_day DESC;
```

**4. Get top 10 best-selling medicines:**
```sql
SELECT m.medicine_name, SUM(si.quantity) AS total_sold, SUM(si.subtotal) AS revenue
FROM sale_items si
JOIN medicines m ON si.medicine_id = m.medicine_id
GROUP BY si.medicine_id
ORDER BY total_sold DESC
LIMIT 10;
```

**5. Get complete sale details with customer and items:**
```sql
SELECT s.sale_id, c.customer_name, s.sale_date, s.total_amount, s.payment_method,
       m.medicine_name, si.quantity, si.unit_price, si.subtotal
FROM sales s
JOIN customers c ON s.customer_id = c.customer_id
JOIN sale_items si ON s.sale_id = si.sale_id
JOIN medicines m ON si.medicine_id = m.medicine_id
WHERE s.sale_id = ?;
```

**6. Dashboard summary stats:**
```sql
SELECT
  (SELECT COUNT(*) FROM medicines) AS total_medicines,
  (SELECT COUNT(*) FROM customers) AS total_customers,
  (SELECT SUM(total_amount) FROM sales WHERE DATE(sale_date) = CURDATE()) AS today_revenue,
  (SELECT COUNT(*) FROM medicines WHERE stock_quantity <= reorder_level) AS low_stock_count;
```

**7. Stock update trigger after a sale (run via stored procedure or after insert on sale_items):**
```sql
UPDATE medicines
SET stock_quantity = stock_quantity - ?
WHERE medicine_id = ?;
```

**8. Stock update after purchase is received:**
```sql
UPDATE medicines
SET stock_quantity = stock_quantity + ?
WHERE medicine_id = ?;
```

---

---

## SECTION 2: BACKEND (Express.js)

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `mysql2`
- **Auth**: `jsonwebtoken` + `bcryptjs`
- **Middleware**: `cors`, `dotenv`, `express-validator`

---

### Folder & File Structure

```
backend/
├── config/
│   └── db.js                     # MySQL connection pool setup
│
├── controllers/
│   ├── authController.js         # Login, logout, get current user
│   ├── medicineController.js     # CRUD for medicines
│   ├── categoryController.js     # CRUD for categories
│   ├── supplierController.js     # CRUD for suppliers
│   ├── customerController.js     # CRUD for customers
│   ├── doctorController.js       # CRUD for doctors
│   ├── prescriptionController.js # CRUD for prescriptions + items
│   ├── saleController.js         # Create sale, get sale history, invoice
│   ├── purchaseController.js     # Create purchase, update status
│   ├── inventoryController.js    # Low stock, expiring medicines
│   ├── dashboardController.js    # Summary stats and charts data
│   └── userController.js         # Admin: manage users
│
├── middleware/
│   ├── authMiddleware.js         # JWT verification middleware
│   └── roleMiddleware.js         # Role-based access control
│
├── routes/
│   ├── authRoutes.js
│   ├── medicineRoutes.js
│   ├── categoryRoutes.js
│   ├── supplierRoutes.js
│   ├── customerRoutes.js
│   ├── doctorRoutes.js
│   ├── prescriptionRoutes.js
│   ├── saleRoutes.js
│   ├── purchaseRoutes.js
│   ├── inventoryRoutes.js
│   ├── dashboardRoutes.js
│   └── userRoutes.js
│
├── utils/
│   └── helpers.js                # Common utility functions
│
├── .env                          # DB credentials, JWT_SECRET, PORT
├── .env.example
├── package.json
└── server.js                     # App entry point, mounts all routes
```

---

### API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login and receive JWT |
| GET | `/api/auth/me` | Get current logged-in user |
| GET | `/api/dashboard/stats` | Summary stats for dashboard |
| GET | `/api/medicines` | Get all medicines |
| POST | `/api/medicines` | Add new medicine |
| PUT | `/api/medicines/:id` | Update medicine |
| DELETE | `/api/medicines/:id` | Delete medicine |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Add category |
| GET | `/api/suppliers` | Get all suppliers |
| POST | `/api/suppliers` | Add supplier |
| GET | `/api/customers` | Get all customers |
| POST | `/api/customers` | Add customer |
| GET | `/api/doctors` | Get all doctors |
| POST | `/api/doctors` | Add doctor |
| GET | `/api/prescriptions` | Get all prescriptions |
| POST | `/api/prescriptions` | Create prescription with items |
| GET | `/api/prescriptions/:id` | Get prescription details |
| POST | `/api/sales` | Create a new sale |
| GET | `/api/sales` | Get all sales |
| GET | `/api/sales/:id` | Get sale invoice details |
| POST | `/api/purchases` | Create purchase order |
| GET | `/api/purchases` | Get all purchases |
| PUT | `/api/purchases/:id/status` | Update purchase status (triggers stock update) |
| GET | `/api/inventory/low-stock` | Get low stock medicines |
| GET | `/api/inventory/expiring` | Get medicines expiring soon |
| GET | `/api/users` | Admin: get all users |
| POST | `/api/users` | Admin: create user |
| PUT | `/api/users/:id` | Admin: update user role/status |

---

---

## SECTION 3: FRONTEND (Next.js)

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API (for auth state)
- **Charts**: Recharts
- **Icons**: lucide-react
- **Notifications**: react-hot-toast

---

### Folder & File Structure

```
frontend/
├── app/
│   ├── layout.js                       # Root layout with sidebar + topbar
│   ├── page.js                         # Redirects to /dashboard
│   │
│   ├── (auth)/
│   │   └── login/
│   │       └── page.js                 # Login page
│   │
│   ├── dashboard/
│   │   └── page.js                     # Dashboard with stats and charts
│   │
│   ├── medicines/
│   │   ├── page.js                     # Medicines list with search/filter
│   │   ├── add/
│   │   │   └── page.js                 # Add new medicine form
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.js             # Edit medicine form
│   │
│   ├── categories/
│   │   └── page.js                     # Categories list + add/edit modal
│   │
│   ├── suppliers/
│   │   ├── page.js                     # Suppliers list
│   │   └── add/
│   │       └── page.js                 # Add supplier form
│   │
│   ├── customers/
│   │   ├── page.js                     # Customers list
│   │   └── add/
│   │       └── page.js                 # Add customer form
│   │
│   ├── doctors/
│   │   └── page.js                     # Doctors list + add modal
│   │
│   ├── prescriptions/
│   │   ├── page.js                     # Prescriptions list
│   │   ├── add/
│   │   │   └── page.js                 # Create prescription form
│   │   └── [id]/
│   │       └── page.js                 # Prescription detail view
│   │
│   ├── sales/
│   │   ├── page.js                     # Sales history
│   │   ├── new/
│   │   │   └── page.js                 # Point-of-sale: create new sale
│   │   └── [id]/
│   │       └── page.js                 # Sale invoice view (printable)
│   │
│   ├── purchases/
│   │   ├── page.js                     # Purchase orders list
│   │   └── add/
│   │       └── page.js                 # Create purchase order form
│   │
│   ├── inventory/
│   │   └── page.js                     # Inventory: low stock + expiring alerts
│   │
│   └── users/
│       └── page.js                     # Admin: manage users
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.js                  # Navigation sidebar
│   │   ├── Topbar.js                   # Top navigation bar
│   │   └── ProtectedRoute.js           # Auth guard wrapper
│   │
│   ├── ui/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Modal.js
│   │   ├── Table.js
│   │   ├── Badge.js
│   │   ├── Card.js
│   │   ├── Spinner.js
│   │   └── Pagination.js
│   │
│   ├── dashboard/
│   │   ├── StatCard.js                 # Summary stat card (e.g., Total Sales)
│   │   ├── SalesChart.js               # Daily revenue bar chart
│   │   └── TopMedicinesChart.js        # Top selling medicines chart
│   │
│   ├── medicines/
│   │   ├── MedicineTable.js
│   │   └── MedicineForm.js
│   │
│   ├── sales/
│   │   ├── SaleForm.js                 # POS sale form with dynamic medicine rows
│   │   └── InvoicePrint.js             # Printable invoice layout
│   │
│   └── inventory/
│       ├── LowStockTable.js
│       └── ExpiryAlertTable.js
│
├── context/
│   └── AuthContext.js                  # JWT auth state + login/logout functions
│
├── lib/
│   └── axios.js                        # Axios instance with base URL + auth header
│
├── hooks/
│   ├── useMedicines.js
│   ├── useSales.js
│   └── useDashboard.js
│
├── utils/
│   └── formatters.js                   # Date formatting, currency formatting helpers
│
├── public/
│   └── logo.png
│
├── .env.local                          # NEXT_PUBLIC_API_URL=http://localhost:5000
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

### Pages & Their Responsibilities

| Page | Responsibility |
|---|---|
| `/login` | JWT login form, stores token in localStorage, redirects to dashboard |
| `/dashboard` | Shows stats cards (total medicines, today's revenue, low stock count) and sales chart |
| `/medicines` | Searchable/filterable table of all medicines with edit/delete actions |
| `/medicines/add` | Form to add new medicine with category and supplier dropdowns |
| `/categories` | List categories, add/edit via modal |
| `/suppliers` | List suppliers, add/edit |
| `/customers` | Customer list with search |
| `/doctors` | Doctor list with add modal |
| `/prescriptions` | List prescriptions; click to view prescription items |
| `/prescriptions/add` | Select customer, doctor, add medicines with dosage |
| `/sales/new` | POS interface: select customer, add medicines, calculate total, submit sale |
| `/sales` | List all past sales with date filter |
| `/sales/:id` | Printable invoice for a specific sale |
| `/purchases` | List purchase orders; button to mark as Received (updates stock) |
| `/purchases/add` | Select supplier, add medicines with quantity and price |
| `/inventory` | Two tables: Low Stock alerts and Expiring Soon alerts |
| `/users` | Admin-only page to manage user accounts and roles |

---

### Important Implementation Notes

1. **Authentication**: Store the JWT in `localStorage`. Attach it as `Authorization: Bearer <token>` header in every API call via the Axios interceptor in `lib/axios.js`.

2. **Protected Routes**: Wrap all pages (except `/login`) with a `ProtectedRoute` component that checks for a valid token. If not logged in, redirect to `/login`.

3. **Role-Based UI**: Hide admin-only menu items (like `/users`) for non-admin roles by reading role from the decoded JWT.

4. **Stock Management**: When a sale is created, the backend must automatically deduct the quantities from `medicines.stock_quantity`. When a purchase is marked as "Received", the backend must add quantities to stock.

5. **POS Sale Form**: The new sale page (`/sales/new`) should have a dynamic row system where staff can search for a medicine, enter quantity, and see auto-calculated subtotal and total.

6. **Print Invoice**: The `/sales/:id` page should have a "Print" button that opens a printer-friendly layout using `window.print()`.

7. **Dashboard Charts**: Use `Recharts` to show a bar chart of daily sales revenue for the past 7 days and a horizontal bar chart of the top 5 selling medicines.

8. **Environment Variables**:
   - Backend `.env`: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`
   - Frontend `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000`

---

*Build the entire application following this specification exactly. Start with the database schema, then the backend API, then the frontend. Ensure all foreign key relationships are enforced, stock updates are transactional, and the UI is clean and functional.*
