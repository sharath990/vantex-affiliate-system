-- Vantex Affiliate System Database Schema

-- Create Database
CREATE DATABASE VantexAffiliate;
USE VantexAffiliate;

-- Affiliates Table
CREATE TABLE Affiliates (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    mt5_rebate_account NVARCHAR(50) NOT NULL UNIQUE,
    contact_details NVARCHAR(MAX),
    ox_ib_link NVARCHAR(500),
    affiliate_code NVARCHAR(20) UNIQUE,
    status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Suspended', 'Banned')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    approved_at DATETIME2 NULL,
    approved_by INT NULL
);

-- Downlines Table
CREATE TABLE Downlines (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    sub1_affiliate_id INT NOT NULL,
    sub2_affiliate_id INT NULL,
    status NVARCHAR(20) DEFAULT 'User Only' CHECK (status IN ('User Only', 'Pending', 'Approved', 'Rejected', 'Suspended', 'Banned')),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (sub1_affiliate_id) REFERENCES Affiliates(id),
    FOREIGN KEY (sub2_affiliate_id) REFERENCES Affiliates(id)
);

-- Admin Users Table
CREATE TABLE AdminUsers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) DEFAULT 'Admin' CHECK (role IN ('Admin', 'SuperAdmin')),
    created_at DATETIME2 DEFAULT GETDATE(),
    last_login DATETIME2 NULL
);

-- Insert default admin user (password: admin123)
INSERT INTO AdminUsers (username, email, password_hash, role) 
VALUES ('admin', 'admin@vantex.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SuperAdmin');