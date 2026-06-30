<?php
/**
 * APPLICANT LOGIN
 * 
 * Authenticates pre-registered applicants against 'pre_registered_users'.
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
$stmt->bind_param("s", $id);
$stmt->execute();
$res = $stmt->get_result();

if ($user = $res->fetch_assoc()) {
    if (!$user['is_email_verified']) send_json_response(false, "Email not verified.", null, 403);
    if (password_verify($password, $user['password_hash'])) {
        $status = "Not Submitted";
        $st_sql = "SELECT admission_status FROM applications WHERE application_id = ?";
        $st_stmt = $conn->prepare($st_sql);
        $st_stmt->bind_param("s", $user['app_id']);
        $st_stmt->execute();
        if($row = $st_stmt->get_result()->fetch_assoc()) $status = $row['admission_status'];

        send_json_response(true, "Login success.", [
            "email" => $user['email'],
            "role" => "applicant",
            "appId" => $user['app_id'],
            "name" => $user['surname'] . " " . $user['firstname'],
            "admissionStatus" => $status
        ]);
    }
}
send_json_response(false, "Invalid credentials.", null, 401);
?>