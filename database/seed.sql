-- ============================================================
-- Pharmacy DBMS – Seed Data
-- Run AFTER schema.sql
-- ============================================================

USE pharmacy_db;

-- ============================================================
-- Default Admin User
-- Password: admin123  (bcrypt hash generated externally)
-- ============================================================
INSERT INTO users (username, password_hash, full_name, role, email, is_active)
VALUES (
  'admin',
  '$2b$10$kIqR3z2BQUv7x5HjXmTuJeGh4YJwY6Fv0OoP3E8nS9LtM1VkZG7B6',
  'System Administrator',
  'admin',
  'admin@pharmacy.com',
  TRUE
);

-- ============================================================
-- Sample Pharmacist
-- Password: pharma123
-- ============================================================
INSERT INTO users (username, password_hash, full_name, role, email, is_active)
VALUES (
  'pharmacist1',
  '$2b$10$9sGk2nC.7rRmHK5IpQ3uOO8uWQFThCBrm8bLZX5TvMdYpGjzEVim2',
  'Riya Sharma',
  'pharmacist',
  'riya@pharmacy.com',
  TRUE
);

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO categories (category_name, description) VALUES
  ('Antibiotics',       'Medicines used to treat bacterial infections'),
  ('Analgesics',        'Pain relief medicines'),
  ('Antidiabetic',      'Medicines for managing diabetes'),
  ('Antihypertensive',  'Medicines for high blood pressure'),
  ('Vitamins',          'Vitamins and dietary supplements'),
  ('Antacids',          'Medicines for acidity and gastric issues'),
  ('Antihistamines',    'Medicines for allergies'),
  ('Antipyretics',      'Fever-reducing medicines'),
  ('Cough & Cold',      'Medicines for cough, cold and flu'),
  ('Skincare',          'Topical creams and ointments');

-- ============================================================
-- Suppliers
-- ============================================================
INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, city) VALUES
  ('MedPharma Distributors',  'Anil Kumar',   '9876543210', 'anil@medpharma.com',   '12 Industrial Area, Phase 2', 'Delhi'),
  ('HealthFirst Supplies',    'Priya Nair',   '9812345678', 'priya@healthfirst.com', '45 MG Road',                  'Mumbai'),
  ('CureMed Pvt Ltd',         'Rohit Singh',  '9934567890', 'rohit@curemed.com',     'Plot 7, Sector 18',           'Noida'),
  ('PharmLinks India',        'Sunita Rao',   '9845671234', 'sunita@pharmlinks.com', 'Old Market, Lane 3',          'Hyderabad'),
  ('LifeCare Agencies',       'Vikram Joshi', '9701234567', 'vikram@lifecare.com',   '88 Ring Road',                'Pune');

-- ============================================================
-- Doctors
-- ============================================================
INSERT INTO doctors (doctor_name, specialization, phone, license_number) VALUES
  ('Dr. Anjali Mehta',   'General Physician',  '9811122233', 'MCI-2021-001'),
  ('Dr. Ramesh Gupta',   'Cardiologist',       '9822233344', 'MCI-2019-045'),
  ('Dr. Kavitha Iyer',   'Endocrinologist',    '9833344455', 'MCI-2020-112'),
  ('Dr. Sameer Patel',   'Pulmonologist',      '9844455566', 'MCI-2018-078'),
  ('Dr. Neha Verma',     'Dermatologist',      '9855566677', 'MCI-2022-033');

-- ============================================================
-- Medicines
-- ============================================================
INSERT INTO medicines (medicine_name, generic_name, category_id, supplier_id, unit, purchase_price, selling_price, stock_quantity, reorder_level, expiry_date, description) VALUES
  ('Amoxicillin 500mg',      'Amoxicillin',         1, 1, 'Capsule', 3.50,  6.00,  200, 20, '2026-12-31', 'Broad-spectrum antibiotic'),
  ('Paracetamol 500mg',      'Paracetamol',         8, 2, 'Tablet',  0.80,  1.50,  500, 50, '2027-06-30', 'Fever and mild pain relief'),
  ('Metformin 500mg',        'Metformin HCl',       3, 3, 'Tablet',  2.00,  4.00,  150, 20, '2026-09-30', 'Oral antidiabetic agent'),
  ('Amlodipine 5mg',         'Amlodipine',          4, 1, 'Tablet',  1.50,  3.00,  300, 30, '2027-03-31', 'Calcium channel blocker for BP'),
  ('Cetirizine 10mg',        'Cetirizine HCl',      7, 4, 'Tablet',  1.20,  2.50,  400, 30, '2026-11-30', 'Antihistamine for allergies'),
  ('Omeprazole 20mg',        'Omeprazole',          6, 5, 'Capsule', 2.50,  5.00,  250, 25, '2026-08-31', 'Proton pump inhibitor for acidity'),
  ('Vitamin C 500mg',        'Ascorbic Acid',       5, 2, 'Tablet',  1.00,  2.00,  600, 50, '2027-01-31', 'Vitamin C supplement'),
  ('Azithromycin 250mg',     'Azithromycin',        1, 3, 'Tablet',  8.00, 15.00,   80, 15, '2026-07-31', 'Macrolide antibiotic'),
  ('Ibuprofen 400mg',        'Ibuprofen',           2, 1, 'Tablet',  1.50,  3.00,  350, 30, '2027-02-28', 'NSAID for pain and inflammation'),
  ('Dextromethorphan Syrup', 'Dextromethorphan',    9, 4, 'Syrup',  45.00, 80.00,   40, 10, '2026-05-31', 'Cough suppressant syrup'),
  ('Betamethasone Cream',    'Betamethasone',      10, 5, 'Cream',  25.00, 45.00,   60, 10, '2026-10-31', 'Topical corticosteroid'),
  ('Atorvastatin 10mg',      'Atorvastatin',        4, 2, 'Tablet',  5.00, 10.00,    8, 20, '2027-04-30', 'Statin for cholesterol management');

-- ============================================================
-- Sample Customers
-- ============================================================
INSERT INTO customers (customer_name, phone, email, address, date_of_birth) VALUES
  ('Ramesh Khanna',   '9901234567', 'ramesh.k@email.com',  '15 Gandhi Nagar, Delhi',        '1975-04-20'),
  ('Sunita Devi',     '9912345678', 'sunita.d@email.com',  '22 Lajpat Nagar, Delhi',        '1988-08-15'),
  ('Arjun Kapoor',    '9923456789', 'arjun.k@email.com',   '7 MG Road, Bengaluru',          '1995-03-10'),
  ('Meena Pillai',    '9934567890', 'meena.p@email.com',   '34 Anna Nagar, Chennai',        '1960-11-25'),
  ('Rohit Malhotra',  '9945678901', 'rohit.m@email.com',   '88 Park Street, Kolkata',       '1982-07-07');
