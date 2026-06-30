<?php
/**
 * MAIN PORTAL LOGIN
 * 
 * Authenticates Admins, Instructors, and Staff against the 'users' table.
 */

ini_set('display_errors', 0); 
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Max-Age: 86400");
    http_response_code(204);
    exit(0);
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['appIdOrEmail']) || !isset($data['password'])) {
    send_json_response(false, "Missing login credentials.", null, 400);
}

$login_id = trim($data['appIdOrEmail']);
$password = $data['password'];

// Check against 'users' table
$sql = "SELECT id, email, password_hash, full_name, role, staff_id, student_matric_no 
        FROM users 
        WHERE email = ? OR student_matric_no = ? OR staff_id = ?";
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("sss", $login_id, $login_id, $login_id);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user['password_hash'])) {
                $res_data = [
                    "email" => $user['email'],
                    "role" => $user['role'],
                    "name" => $user['full_name']
                ];
                
                if ($user['role'] === 'student') {
                    $res_data['appId'] = $user['student_matric_no'];
                } elseif (!empty($user['staff_id'])) {
                     $res_data['appId'] = $user['staff_id'];
                }

                send_json_response(true, "Login successful.", $res_data);
            }
        }
        send_json_response(false, "Invalid credentials or account not found.", null, 401);
    } else {
        send_json_response(false, "Database execution error.", null, 500);
    }
    $stmt->close();
} else {
    send_json_response(false, "Database preparation error.", null, 500);
}
?>