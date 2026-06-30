-- SEED USERS SQL
-- Use this script to register the specific instructors and admin into your 'users' table.
-- Default password for all these accounts is: password

INSERT INTO users (email, password_hash, full_name, role, staff_id, department)
VALUES 
('sani.mohammed@siat.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Sani Mohammed', 'instructor', 'STF/045', 'Computer Science'),
('grace.bitrus@siat.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mrs. Grace Bitrus', 'instructor', 'STF/067', 'Business Administration'),
('superadmin@siat.edu.ng', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super Admin', 'admin', 'ADM/002', 'IT Registry');
