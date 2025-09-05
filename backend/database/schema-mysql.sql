-- Create Database
CREATE DATABASE IF NOT EXISTS VantexAffiliate;
USE VantexAffiliate;

-- Affiliates Table
CREATE TABLE Affiliates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mt5_rebate_account VARCHAR(50) NOT NULL UNIQUE,
    contact_details TEXT,
    ox_ib_link VARCHAR(500),
    affiliate_code VARCHAR(20) UNIQUE,
    status ENUM('Pending', 'Approved', 'Rejected', 'Suspended', 'Banned') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    approved_at TIMESTAMP NULL,
    approved_by INT NULL
);

-- Downlines Table
CREATE TABLE Downlines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    sub1_affiliate_id INT NOT NULL,
    sub2_affiliate_id INT NULL,
    status ENUM('User Only', 'Pending', 'Approved', 'Rejected', 'Suspended', 'Banned') DEFAULT 'User Only',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sub1_affiliate_id) REFERENCES Affiliates(id),
    FOREIGN KEY (sub2_affiliate_id) REFERENCES Affiliates(id)
);

-- Admin Users Table
CREATE TABLE AdminUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'SuperAdmin') DEFAULT 'Admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO AdminUsers (username, email, password_hash, role) 
VALUES ('admin', 'admin@vantex.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SuperAdmin');

-- Trigger to auto-generate affiliate code
DELIMITER //
CREATE TRIGGER generate_affiliate_code 
AFTER INSERT ON Affiliates 
FOR EACH ROW 
BEGIN
    UPDATE Affiliates 
    SET affiliate_code = CONCAT('VTX', LPAD(NEW.id, 5, '0'))
    WHERE id = NEW.id;
END//
DELIMITER ;