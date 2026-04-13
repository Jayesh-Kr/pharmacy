-- ============================================================
-- Pharmacy DBMS - Database Schema
-- Database: pharmacy_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS pharmacy_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pharmacy_db;

-- ============================================================
-- TABLE 1: categories
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  category_id   INT           NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(100)  NOT NULL,
  description   TEXT,
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_categories PRIMARY KEY (category_id),
  CONSTRAINT uq_category_name UNIQUE (category_name)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 2: suppliers
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id    INT           NOT NULL AUTO_INCREMENT,
  supplier_name  VARCHAR(150)  NOT NULL,
  contact_person VARCHAR(100),
  phone          VARCHAR(15)   NOT NULL,
  email          VARCHAR(100),
  address        TEXT,
  city           VARCHAR(100),
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_suppliers PRIMARY KEY (supplier_id),
  CONSTRAINT uq_supplier_email UNIQUE (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 3: medicines
-- ============================================================
CREATE TABLE IF NOT EXISTS medicines (
  medicine_id    INT            NOT NULL AUTO_INCREMENT,
  medicine_name  VARCHAR(150)   NOT NULL,
  generic_name   VARCHAR(150),
  category_id    INT,
  supplier_id    INT,
  unit           VARCHAR(50),
  purchase_price DECIMAL(10,2)  NOT NULL,
  selling_price  DECIMAL(10,2)  NOT NULL,
  stock_quantity INT            NOT NULL DEFAULT 0,
  reorder_level  INT            NOT NULL DEFAULT 10,
  expiry_date    DATE,
  description    TEXT,
  created_at     TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_medicines   PRIMARY KEY (medicine_id),
  CONSTRAINT fk_med_cat     FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL,
  CONSTRAINT fk_med_sup     FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)  ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 4: customers
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  customer_id   INT          NOT NULL AUTO_INCREMENT,
  customer_name VARCHAR(150) NOT NULL,
  phone         VARCHAR(15)  NOT NULL,
  email         VARCHAR(100),
  address       TEXT,
  date_of_birth DATE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_customers PRIMARY KEY (customer_id)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 5: doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  doctor_id      INT          NOT NULL AUTO_INCREMENT,
  doctor_name    VARCHAR(150) NOT NULL,
  specialization VARCHAR(100),
  phone          VARCHAR(15),
  license_number VARCHAR(100),
  CONSTRAINT pk_doctors       PRIMARY KEY (doctor_id),
  CONSTRAINT uq_license_number UNIQUE (license_number)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 6: prescriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  prescription_id   INT  NOT NULL AUTO_INCREMENT,
  customer_id       INT  NOT NULL,
  doctor_id         INT  NOT NULL,
  prescription_date DATE NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_prescriptions PRIMARY KEY (prescription_id),
  CONSTRAINT fk_pres_cust     FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
  CONSTRAINT fk_pres_doc      FOREIGN KEY (doctor_id)   REFERENCES doctors(doctor_id)    ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 7: prescription_items
-- ============================================================
CREATE TABLE IF NOT EXISTS prescription_items (
  item_id         INT          NOT NULL AUTO_INCREMENT,
  prescription_id INT          NOT NULL,
  medicine_id     INT          NOT NULL,
  dosage          VARCHAR(100),
  quantity        INT          NOT NULL,
  duration_days   INT,
  CONSTRAINT pk_prescription_items PRIMARY KEY (item_id),
  CONSTRAINT fk_pi_pres FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_med  FOREIGN KEY (medicine_id)     REFERENCES medicines(medicine_id)         ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 8: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id       INT                                  NOT NULL AUTO_INCREMENT,
  username      VARCHAR(100)                         NOT NULL,
  password_hash VARCHAR(255)                         NOT NULL,
  full_name     VARCHAR(150)                         NOT NULL,
  role          ENUM('admin','pharmacist','cashier')  NOT NULL DEFAULT 'cashier',
  email         VARCHAR(100),
  is_active     BOOLEAN                              NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP                            NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT pk_users      PRIMARY KEY (user_id),
  CONSTRAINT uq_username   UNIQUE (username),
  CONSTRAINT uq_user_email UNIQUE (email)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 9: sales
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  sale_id        INT                                          NOT NULL AUTO_INCREMENT,
  customer_id    INT                                          NOT NULL,
  prescription_id INT,
  sale_date      DATETIME                                     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount   DECIMAL(10,2)                                NOT NULL,
  discount       DECIMAL(10,2)                                NOT NULL DEFAULT 0.00,
  paid_amount    DECIMAL(10,2)                                NOT NULL,
  payment_method ENUM('Cash','Card','UPI','Insurance')        NOT NULL DEFAULT 'Cash',
  created_by     VARCHAR(100),
  CONSTRAINT pk_sales      PRIMARY KEY (sale_id),
  CONSTRAINT fk_sale_cust  FOREIGN KEY (customer_id)     REFERENCES customers(customer_id)         ON DELETE RESTRICT,
  CONSTRAINT fk_sale_pres  FOREIGN KEY (prescription_id) REFERENCES prescriptions(prescription_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 10: sale_items
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  sale_item_id INT           NOT NULL AUTO_INCREMENT,
  sale_id      INT           NOT NULL,
  medicine_id  INT           NOT NULL,
  quantity     INT           NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,
  subtotal     DECIMAL(10,2) NOT NULL,
  CONSTRAINT pk_sale_items PRIMARY KEY (sale_item_id),
  CONSTRAINT fk_si_sale FOREIGN KEY (sale_id)     REFERENCES sales(sale_id)       ON DELETE CASCADE,
  CONSTRAINT fk_si_med  FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 11: purchases
-- ============================================================
CREATE TABLE IF NOT EXISTS purchases (
  purchase_id    INT                                     NOT NULL AUTO_INCREMENT,
  supplier_id    INT                                     NOT NULL,
  purchase_date  DATETIME                                NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount   DECIMAL(10,2)                           NOT NULL,
  invoice_number VARCHAR(100),
  status         ENUM('Pending','Received','Cancelled')  NOT NULL DEFAULT 'Pending',
  created_by     VARCHAR(100),
  CONSTRAINT pk_purchases       PRIMARY KEY (purchase_id),
  CONSTRAINT uq_invoice_number  UNIQUE (invoice_number),
  CONSTRAINT fk_pur_sup         FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TABLE 12: purchase_items
-- ============================================================
CREATE TABLE IF NOT EXISTS purchase_items (
  purchase_item_id INT           NOT NULL AUTO_INCREMENT,
  purchase_id      INT           NOT NULL,
  medicine_id      INT           NOT NULL,
  quantity         INT           NOT NULL,
  unit_price       DECIMAL(10,2) NOT NULL,
  subtotal         DECIMAL(10,2) NOT NULL,
  expiry_date      DATE,
  CONSTRAINT pk_purchase_items PRIMARY KEY (purchase_item_id),
  CONSTRAINT fk_puritem_pur FOREIGN KEY (purchase_id) REFERENCES purchases(purchase_id)   ON DELETE CASCADE,
  CONSTRAINT fk_puritem_med FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)   ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ============================================================
-- TRIGGER: Deduct stock after sale_item is inserted
-- ============================================================
DROP TRIGGER IF EXISTS trg_deduct_stock_after_sale;
DELIMITER $$
CREATE TRIGGER trg_deduct_stock_after_sale
AFTER INSERT ON sale_items
FOR EACH ROW
BEGIN
  UPDATE medicines
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE medicine_id = NEW.medicine_id;
END$$
DELIMITER ;

-- ============================================================
-- TRIGGER: Restore stock if a sale is deleted (rollback)
-- ============================================================
DROP TRIGGER IF EXISTS trg_restore_stock_after_sale_delete;
DELIMITER $$
CREATE TRIGGER trg_restore_stock_after_sale_delete
AFTER DELETE ON sale_items
FOR EACH ROW
BEGIN
  UPDATE medicines
  SET stock_quantity = stock_quantity + OLD.quantity
  WHERE medicine_id = OLD.medicine_id;
END$$
DELIMITER ;

-- ============================================================
-- TRIGGER: Add stock when purchase status changes to 'Received'
-- (Handled in application layer via stored procedure below)
-- ============================================================
DROP PROCEDURE IF EXISTS sp_receive_purchase;
DELIMITER $$
CREATE PROCEDURE sp_receive_purchase(IN p_purchase_id INT)
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE v_medicine_id INT;
  DECLARE v_quantity INT;

  DECLARE cur CURSOR FOR
    SELECT medicine_id, quantity FROM purchase_items WHERE purchase_id = p_purchase_id;
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

  START TRANSACTION;

  OPEN cur;
  read_loop: LOOP
    FETCH cur INTO v_medicine_id, v_quantity;
    IF done THEN
      LEAVE read_loop;
    END IF;
    UPDATE medicines
    SET stock_quantity = stock_quantity + v_quantity
    WHERE medicine_id = v_medicine_id;
  END LOOP;
  CLOSE cur;

  UPDATE purchases SET status = 'Received' WHERE purchase_id = p_purchase_id;

  COMMIT;
END$$
DELIMITER ;
