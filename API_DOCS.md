# Pharmacy DBMS - API Documentation

## 1. Authentication
All routes except `/api/auth/login` and `/api/health` require a JWT token in the `Authorization` header: `Bearer <token>`.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/health` | Service health check | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth/me` | Get profile of logged-in user | Private |

---

## 2. Dashboard & Inventory
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Summary stats (Medicines, Customers, Today's Revenue, Low Stock Count) | Private |
| GET | `/api/dashboard/sales-chart` | Daily revenue chart data (Last 7 days) | Private |
| GET | `/api/dashboard/top-medicines` | Top 5 best selling medicines | Private |
| GET | `/api/inventory/low-stock` | List medicines with stock <= reorder level | Private |
| GET | `/api/inventory/expiring` | List medicines expiring within 30 days | Private |

---

## 3. Medicines & Categories
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/medicines` | Get all medicines with category/supplier info | Private |
| POST | `/api/medicines` | Add new medicine | Admin, Pharmacist |
| PUT | `/api/medicines/:id` | Update medicine details | Admin, Pharmacist |
| DELETE | `/api/medicines/:id` | Remove a medicine | Admin |
| GET | `/api/categories` | Get all medicine categories | Private |
| POST | `/api/categories` | Add a new category | Admin, Pharmacist |
| PUT | `/api/categories/:id` | Update category details | Admin, Pharmacist |
| DELETE | `/api/categories/:id` | Delete a category (if not in use) | Admin |

---

## 4. Sales & POS
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/sales` | Create a new sale (Deducts stock automatically via triggers) | Private |
| GET | `/api/sales` | Get full sales transaction history | Private |
| GET | `/api/sales/:id` | Get individual sale details (Header + Items) for invoice | Private |

---

## 5. Purchases & Suppliers
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/suppliers` | List all medicine suppliers | Private |
| POST | `/api/suppliers` | Add new supplier | Admin, Pharmacist |
| GET | `/api/purchases` | List all purchase orders | Private |
| POST | `/api/purchases` | Create a new purchase order ('Pending' by default) | Admin, Pharmacist |
| PUT | `/api/purchases/:id/status` | Mark as 'Received' (Updates stock via sp_receive_purchase) | Admin, Pharmacist |

---

## 6. Customers, Doctors & Prescriptions
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/customers` | Get all customers | Private |
| POST | `/api/customers` | Register a new customer | Private |
| GET | `/api/doctors` | List all prescribing doctors | Private |
| POST | `/api/doctors` | Add a new doctor | Admin, Pharmacist |
| GET | `/api/prescriptions` | Get all stored prescriptions | Private |
| POST | `/api/prescriptions` | Add a new prescription with items | Private |
| GET | `/api/prescriptions/:id` | Get details of a single prescription | Private |

---

## 7. User Management
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/users` | List all system users | Admin |
| POST | `/api/users` | Register a new user (`admin`, `pharmacist`, `cashier`) | Admin |
| PUT | `/api/users/:id` | Update user status/details | Admin |
