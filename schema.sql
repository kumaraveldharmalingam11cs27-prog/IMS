-- Provigent Inventory Management System Database Schema

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `username` VARCHAR(80) UNIQUE NOT NULL,
  `email` VARCHAR(120) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(120),
  `role` ENUM('admin', 'manager', 'staff') DEFAULT 'staff',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);

CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `contact_person` VARCHAR(120),
  `email` VARCHAR(120),
  `phone` VARCHAR(20),
  `address` TEXT,
  `city` VARCHAR(50),
  `state` VARCHAR(50),
  `postal_code` VARCHAR(20),
  `country` VARCHAR(50),
  `website` VARCHAR(255),
  `payment_terms` VARCHAR(100),
  `lead_time_days` INT DEFAULT 7,
  `rating` DECIMAL(3,2),
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_active (is_active)
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(80) NOT NULL UNIQUE,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);

CREATE TABLE IF NOT EXISTS `inventory_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `sku` VARCHAR(50) UNIQUE NOT NULL,
  `barcode` VARCHAR(100),
  `description` TEXT,
  `category_id` INT,
  `unit` VARCHAR(20) DEFAULT 'piece',
  `current_quantity` INT DEFAULT 0,
  `min_quantity` INT DEFAULT 10,
  `max_quantity` INT DEFAULT 100,
  `reorder_quantity` INT DEFAULT 50,
  `unit_cost` DECIMAL(10,2),
  `supplier_id` INT,
  `last_restocked` TIMESTAMP,
  `expiry_date` DATE,
  `location` VARCHAR(100),
  `notes` TEXT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  INDEX idx_sku (sku),
  INDEX idx_name (name),
  INDEX idx_barcode (barcode),
  INDEX idx_category (category_id),
  INDEX idx_quantity (current_quantity)
);

CREATE TABLE IF NOT EXISTS `stock_history` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_id` INT NOT NULL,
  `previous_quantity` INT,
  `new_quantity` INT,
  `transaction_type` ENUM('purchase', 'sale', 'adjustment', 'return', 'damage', 'count') DEFAULT 'sale',
  `quantity_change` INT,
  `reference_id` VARCHAR(50),
  `notes` TEXT,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_item (item_id),
  INDEX idx_date (created_at),
  INDEX idx_type (transaction_type)
);

CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `supplier_id` INT NOT NULL,
  `order_date` DATE DEFAULT CURDATE(),
  `expected_delivery_date` DATE,
  `actual_delivery_date` DATE,
  `status` ENUM('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'draft',
  `total_amount` DECIMAL(12,2),
  `notes` TEXT,
  `created_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status),
  INDEX idx_date (order_date),
  INDEX idx_order_number (order_number)
);

CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `quantity_ordered` INT NOT NULL,
  `quantity_received` INT DEFAULT 0,
  `unit_price` DECIMAL(10,2),
  `line_total` DECIMAL(12,2),
  `received_date` DATE,
  `notes` TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  INDEX idx_order (order_id),
  INDEX idx_item (item_id)
);

CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `alert_type` ENUM('low_stock', 'out_of_stock', 'overstock', 'order_delayed', 'expiry_warning', 'system') DEFAULT 'low_stock',
  `item_id` INT,
  `order_id` INT,
  `title` VARCHAR(200),
  `description` TEXT,
  `severity` ENUM('info', 'warning', 'critical') DEFAULT 'warning',
  `is_resolved` BOOLEAN DEFAULT FALSE,
  `resolved_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_type (alert_type),
  INDEX idx_severity (severity),
  INDEX idx_resolved (is_resolved)
);

CREATE TABLE IF NOT EXISTS `stock_adjustments` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `item_id` INT NOT NULL,
  `adjustment_quantity` INT NOT NULL,
  `reason` VARCHAR(200),
  `notes` TEXT,
  `adjusted_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (adjusted_by) REFERENCES users(id),
  INDEX idx_item (item_id),
  INDEX idx_date (created_at)
);

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` INT,
  `action` VARCHAR(200),
  `table_name` VARCHAR(100),
  `record_id` INT,
  `old_values` JSON,
  `new_values` JSON,
  `ip_address` VARCHAR(45),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_table (table_name),
  INDEX idx_date (created_at)
);

-- Create default categories
INSERT INTO categories (name, description) VALUES
('Raw Materials', 'Raw materials and bulk supplies'),
('Finished Goods', 'Finished products ready for sale'),
('Packaging', 'Packaging materials'),
('Equipment', 'Tools and equipment'),
('Other', 'Miscellaneous items');

-- Create admin user (password: admin123 - change in production!)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@provigent.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5YmMxSUl2hAey', 'Administrator', 'admin');

-- Create some sample data
INSERT INTO suppliers (name, contact_person, email, phone, city, country, lead_time_days, is_active) VALUES
('Fresh Foods Co', 'John Smith', 'john@freshfoods.com', '555-0101', 'Chicago', 'USA', 3, TRUE),
('West Coast Supplies', 'Maria Garcia', 'maria@westcoast.com', '555-0102', 'Los Angeles', 'USA', 5, TRUE),
('Regional Distributor', 'Robert Johnson', 'robert@regional.com', '555-0103', 'Denver', 'USA', 2, TRUE);

INSERT INTO inventory_items (name, sku, barcode, category_id, unit, min_quantity, max_quantity, unit_cost, supplier_id, location) VALUES
('Coffee Beans', 'SKU-001', '1234567890001', 1, 'kg', 10, 50, 8.50, 1, 'A1-01'),
('Paper Cups', 'SKU-002', '1234567890002', 3, 'box', 50, 200, 12.00, 2, 'A2-01'),
('Milk', 'SKU-003', '1234567890003', 1, 'liter', 10, 50, 1.50, 1, 'A1-02'),
('Sugar', 'SKU-004', '1234567890004', 1, 'kg', 15, 40, 0.80, 3, 'A1-03');
