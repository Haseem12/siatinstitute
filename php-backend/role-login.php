<?php
/**
 * MAIN PORTAL LOGIN
 * 
 * Authenticates Admins, Instructors, and registered Students against the 'users' table.
 */

require_once 'db_connect.php';

// Handle CORS Preflight
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

if (!$data || !isset($data['appIdOrEmail']) || !isset($data['password'])) {
    send_json_response(false, "Missing credentials.", null, 400);
}

$id = trim($data['appIdOrEmail']);
$password = $data['password'];

$sql = "SELECT id, email, password_hash, full_name, role, staff_id, student_matric_no 
        FROM users 
        WHERE email = ? OR student_matric_no = ? OR staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $id, $id, $id);
$stmt->execute();
$res = $stmt->get_result();

if ($user = $res->fetch_assoc()) {
    if (password_verify($password, $user['password_hash'])) {
        $res_data = [
            "email" => $user['email'],
            "role" => $user['role'],
            "name" => $user['full_name']
        ];
        if ($user['role'] === 'student') $res_data['appId'] = $user['student_matric_no'];
        elseif (!empty($user['staff_id'])) $res_data['appId'] = $user['staff_id'];

        send_json_response(true, "Login successful.", $res_data);
    }
}

send_json_response(false, "Invalid credentials.", null, 401);
?>