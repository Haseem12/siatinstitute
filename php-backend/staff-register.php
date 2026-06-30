<?php
/**
 * STAFF REGISTRATION
 * 
 * Allows new Instructors and Admins to create accounts.
 */

require_once 'db_connect.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) send_json_response(false, "Invalid JSON.", null, 400);

$req = ['fullName', 'email', 'password', 'staffId', 'role']; 
foreach ($req as $f) if (empty($data[$f])) send_json_response(false, "Missing field: $f", null, 400);

$email = trim($data['email']);
$staff_id = trim($data['staffId']);
$role = $data['role'];

// Check if email or staff ID already exists
$check_sql = "SELECT id FROM users WHERE email = ? OR staff_id = ?";
$stmt = $conn->prepare($check_sql);
$stmt->bind_param("ss", $email, $staff_id);
$stmt->execute();
if ($stmt->get_result()->num_rows > 0) {
    send_json_response(false, "Email or Staff ID already registered.", null, 409);
}

$hash = password_hash($data['password'], PASSWORD_DEFAULT);

$sql = "INSERT INTO users (email, password_hash, full_name, role, staff_id, department) VALUES (?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssss", $email, $hash, $data['fullName'], $role, $staff_id, $data['department']);

if ($stmt->execute()) {
    send_json_response(true, "Staff account created successfully! You can now log in.");
} else {
    send_json_response(false, "Error: " . $stmt->error, null, 500);
}
?>
