<?php
/**
 * ADMIN: ADD USER
 * 
 * Adds a new user record to the 'users' table.
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

$req = ['name', 'email', 'password', 'studentId', 'role']; 
foreach ($req as $f) if (empty($data[$f])) send_json_response(false, "Missing: $f", null, 400);

$hash = password_hash($data['password'], PASSWORD_DEFAULT);
$role = $data['role'];
$gid = $data['studentId'];

$staff_id = ($role !== 'student') ? $gid : null;
$matric = ($role === 'student') ? $gid : null;

$sql = "INSERT INTO users (email, password_hash, full_name, role, staff_id, student_matric_no, department, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssss", $data['email'], $hash, $data['name'], $role, $staff_id, $matric, $data['department'], $data['level']);

if ($stmt->execute()) {
    send_json_response(true, "User added successfully.");
} else {
    send_json_response(false, "Error: " . $stmt->error, null, 500);
}
?>