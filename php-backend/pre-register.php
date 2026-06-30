<?php
/**
 * PRE-REGISTER APPLICANT
 * 
 * Creates a record in 'pre_registered_users', generates a code, and sends an email.
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

$req = ['surname', 'firstname', 'email', 'password'];
foreach ($req as $f) if (empty($data[$f])) send_json_response(false, "Missing: $f", null, 400);

$email = trim($data['email']);
$surname = trim($data['surname']);
$firstname = trim($data['firstname']);
$othername = trim($data['othername'] ?? "");
$password = $data['password'];

// Check if already registered
$sql = "SELECT app_id, is_email_verified FROM pre_registered_users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();

if ($user = $res->fetch_assoc()) {
    if ($user['is_email_verified']) {
        send_json_response(true, "Email already verified. Please login.", ["appId" => $user['app_id'], "emailVerified" => true], 200);
    } else {
        // Resend logic
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $up_sql = "UPDATE pre_registered_users SET verification_code = ? WHERE email = ?";
        $up_stmt = $conn->prepare($up_sql);
        $up_stmt->bind_param("ss", $code, $email);
        
        if ($up_stmt->execute()) {
            $sent = send_verification_email($email, $firstname, $code);
            send_json_response(true, "A verification code has been resent to your email." . ($sent ? "" : " (Warning: Email delivery failed)"), ["appId" => $user['app_id']]);
        } else {
            send_json_response(false, "Failed to update verification code.", null, 500);
        }
    }
}

// New registration
$app_id = "SIAT-APP-" . strtoupper(substr(md5(uniqid($email, true)), 0, 8));
$code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
$hash = password_hash($password, PASSWORD_DEFAULT);

$ins_sql = "INSERT INTO pre_registered_users (app_id, surname, firstname, othername, email, password_hash, verification_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
$ins_stmt = $conn->prepare($ins_sql);
$ins_stmt->bind_param("sssssss", $app_id, $surname, $firstname, $othername, $email, $hash, $code);

if ($ins_stmt->execute()) {
    $sent = send_verification_email($email, $firstname, $code);
    send_json_response(true, "Pre-registration successful. A 6-digit verification code has been sent to your email." . ($sent ? "" : " (Warning: Email delivery failed)"), ["appId" => $app_id]);
} else {
    send_json_response(false, "Registration failed: " . $conn->error, null, 500);
}
?>
