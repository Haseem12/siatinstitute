-- SIAT Database Schema

-- 1. Users Table (Admin, Instructor, Staff, Admitted Students)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'instructor', 'student') NOT NULL,
    staff_id VARCHAR(50) UNIQUE DEFAULT NULL,
    student_matric_no VARCHAR(50) UNIQUE DEFAULT NULL,
    department VARCHAR(100) DEFAULT NULL,
    level VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Pre-registered Users (Applicants)
CREATE TABLE IF NOT EXISTS pre_registered_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    othername VARCHAR(100) DEFAULT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_of_origin VARCHAR(100) NOT NULL,
    nationality VARCHAR(100) NOT NULL,
    preferred_program VARCHAR(255) NOT NULL,
    preferred_campus VARCHAR(255) NOT NULL,
    entry_mode VARCHAR(50) NOT NULL,
    admission_status ENUM('Pending', 'Admitted', 'Not Admitted', 'Not Submitted') DEFAULT 'Pending',
    rejection_reason TEXT DEFAULT NULL,
    admission_number VARCHAR(50) DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;