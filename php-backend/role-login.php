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

// We check email OR student_matric_no OR staff_id
// Note: We use LOWER(?) to make email lookup case-insensitive
$sql = "SELECT id, email, password_hash, full_name, role, staff_id, student_matric_no 
        FROM users 
        WHERE LOWER(email) = LOWER(?) OR student_matric_no = ? OR staff_id = ?";
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
        
        // Populate appId with the appropriate ID for the role
        if ($user['role'] === 'student') {
            $res_data['appId'] = $user['student_matric_no'];
        } elseif (!empty($user['staff_id'])) {
            $res_data['appId'] = $user['staff_id'];
        } else {
            $res_data['appId'] = $user['id']; // Fallback to DB internal ID
        }

        // Check if student has a submitted application to determine redirect
        $status = "Not Submitted";
        $st_sql = "SELECT admission_status FROM applications WHERE application_id = ? OR email = ?";
        $st_stmt = $conn->prepare($st_sql);
        $st_stmt->bind_param("ss", $res_data['appId'], $user['email']);
        $st_stmt->execute();
        if($st_row = $st_stmt->get_result()->fetch_assoc()) {
            $status = $st_row['admission_status'];
        }
        $res_data['admissionStatus'] = $status;

        send_json_response(true, "Login successful.", $res_data);
    }
}

send_json_response(false, "Invalid credentials.", null, 401);
?>
