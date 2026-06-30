-- Scholars Institute of Arts & Technology (SIAT) - Database Schema

CREATE DATABASE IF NOT EXISTS sajfoods_siat;
USE sajfoods_siat;

-- 1. Pre-registered Users (Applicants before full form)
CREATE TABLE IF NOT EXISTS pre_registered_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id VARCHAR(50) UNIQUE NOT NULL,
    surname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    othername VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verification_code VARCHAR(10),
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Applications (Full Details)
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state_of_origin VARCHAR(100),
    nationality VARCHAR(100),
    photograph_name VARCHAR(255),
    photograph_type VARCHAR(50),
    photograph_size INT,
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(20),
    next_of_kin_relationship VARCHAR(50),
    preferred_program VARCHAR(255),
    preferred_campus VARCHAR(255),
    entry_mode VARCHAR(50),
    admission_status ENUM('Not Submitted', 'Pending', 'Admitted', 'Not Admitted') DEFAULT 'Not Submitted',
    rejection_reason TEXT,
    admission_number VARCHAR(100) UNIQUE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. O-Level Qualifications
CREATE TABLE IF NOT EXISTS o_level_qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_db_id INT NOT NULL,
    exam_type VARCHAR(50),
    exam_year VARCHAR(4),
    exam_number VARCHAR(50),
    certificate_file_name VARCHAR(255),
    certificate_file_type VARCHAR(50),
    certificate_file_size INT,
    FOREIGN KEY (application_db_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. O-Level Subjects
CREATE TABLE IF NOT EXISTS o_level_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    o_level_qualification_id INT NOT NULL,
    subject_name VARCHAR(100),
    grade VARCHAR(5),
    FOREIGN KEY (o_level_qualification_id) REFERENCES o_level_qualifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Main Users Table (Admin, Instructors, Registered Students)
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;