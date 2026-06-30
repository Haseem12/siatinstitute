<?php
/**
 * VERIFY APPLICANT EMAIL
 * 
 * Validates the 6-digit code sent during pre-registration.
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

if (!$data || empty($data['email']) || empty($data['verificationCode'])) {
    send_json_response(false, "Missing email or code.", null, 400);
}

$email = trim($data['email']);
$code = trim($data['verificationCode']);

$sql = "SELECT app_id FROM pre_registered_users WHERE email = ? AND verification_code = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$res = $stmt->get_result();

if ($user = $res->fetch_assoc()) {
    $up_sql = "UPDATE pre_registered_users SET is_email_verified = TRUE WHERE email = ?";
    $up_stmt = $conn->prepare($up_sql);
    $up_stmt->bind_param("s", $email);
    if ($up_stmt->execute()) {
        send_json_response(true, "Email verified successfully.", ["appId" => $user['app_id']]);
    }
}

send_json_response(false, "Invalid verification code or email.", null, 401);
?>