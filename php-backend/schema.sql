-- DATABASE SCHEMA FOR SIAT INSTITUTE PORTAL

-- 1. Table for core users (Admins, Instructors, Staff, Admitted Students)
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

-- 2. Table for initial applicant signups
CREATE TABLE IF NOT EXISTS pre_registered_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    app_id VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    othername VARCHAR(100) DEFAULT NULL,
    verification_code VARCHAR(10) DEFAULT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Main applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL,
    address TEXT,
    city VARCHAR(100),
    state_of_origin VARCHAR(100),
    nationality VARCHAR(100),
    photograph_name VARCHAR(255),
    photograph_type VARCHAR(100),
    photograph_size INT,
    next_of_kin_name VARCHAR(255),
    next_of_kin_phone VARCHAR(20),
    next_of_kin_relationship VARCHAR(100),
    preferred_program VARCHAR(255),
    preferred_campus VARCHAR(255),
    entry_mode VARCHAR(50),
    admission_status ENUM('Pending', 'Admitted', 'Not Admitted', 'Not Submitted') DEFAULT 'Pending',
    rejection_reason TEXT,
    admission_number VARCHAR(50) DEFAULT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    FOREIGN KEY (application_id) REFERENCES pre_registered_users(app_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. O-Level Qualifications
CREATE TABLE IF NOT EXISTS o_level_qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_db_id INT NOT NULL,
    exam_type VARCHAR(50),
    exam_year VARCHAR(10),
    exam_number VARCHAR(50),
    certificate_file_name VARCHAR(255),
    certificate_file_type VARCHAR(100),
    certificate_file_size INT,
    FOREIGN KEY (application_db_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. O-Level Subjects
CREATE TABLE IF NOT EXISTS o_level_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    o_level_qualification_id INT NOT NULL,
    subject_name VARCHAR(150),
    grade VARCHAR(10),
    FOREIGN KEY (o_level_qualification_id) REFERENCES o_level_qualifications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. A-Level / Other Qualifications
CREATE TABLE IF NOT EXISTS a_level_qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_db_id INT NOT NULL,
    qualification_type VARCHAR(100),
    institution VARCHAR(255),
    course_of_study VARCHAR(255),
    grade_or_class VARCHAR(50),
    year_awarded VARCHAR(10),
    certificate_file_name VARCHAR(255),
    certificate_file_type VARCHAR(100),
    certificate_file_size INT,
    FOREIGN KEY (application_db_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Work Experiences
CREATE TABLE IF NOT EXISTS experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    application_db_id INT NOT NULL,
    organization VARCHAR(255),
    role VARCHAR(255),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    document_file_name VARCHAR(255),
    document_file_type VARCHAR(100),
    document_file_size INT,
    FOREIGN KEY (application_db_id) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;