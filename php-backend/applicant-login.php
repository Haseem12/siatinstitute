<?php
/**
 * APPLICANT LOGIN
 * 
 * Authenticates pre-registered applicants against 'pre_registered_users'.
 */

ini_set('display_errors', 0); 
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php-error.log');
error_reporting(E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED);

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Origin: *");
    http_response_code(204);
    exit(0);
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once 'db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['appIdOrEmail']) || !isset($data['password'])) {
    send_json_response(false, "Missing credentials.", null, 400);
}

$id = trim($data['appIdOrEmail']);
$password = $data['password'];
$is_email = filter_var($id, FILTER_VALIDATE_EMAIL);

$sql = "SELECT app_id, email, password_hash, surname, firstname, is_email_verified 
        FROM pre_registered_users 
        WHERE " . ($is_email ? "email = ?" : "app_id = ?");
$stmt = $conn->prepare($sql);

if ($stmt) {
    $stmt->bind_param("s", $id);
    if ($stmt->execute()) {
        $res = $stmt->get_result();
        if ($user = $res->fetch_assoc()) {
            if (!$user['is_email_verified']) {
                send_json_response(false, "Email not verified.", null, 403);
            }
            if (password_verify($password, $user['password_hash'])) {
                // Fetch status from applications table if it exists
                $status = "Not Submitted";
                $st_sql = "SELECT admission_status FROM applications WHERE application_id = ?";
                $st_stmt = $conn->prepare($st_sql);
                if($st_stmt) {
                    $st_stmt->bind_param("s", $user['app_id']);
                    if($st_stmt->execute()) {
                        $st_res = $st_stmt->get_result();
                        if($row = $st_res->fetch_assoc()) $status = $row['admission_status'];
                    }
                    $st_stmt->close();
                }

                send_json_response(true, "Login success.", [
                    "email" => $user['email'],
                    "role" => "applicant",
                    "appId" => $user['app_id'],
                    "name" => $user['surname'] . " " . $user['firstname'],
                    "admissionStatus" => $status
                ]);
            }
        }
        send_json_response(false, "Invalid Application ID or Password.", null, 401);
    }
    $stmt->close();
}
send_json_response(false, "Database error.", null, 500);
?>