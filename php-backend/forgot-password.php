<?php
/**
 * FORGOT PASSWORD
 * 
 * Generates a temporary reset code and sends it to the user's email.
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

if (!$data || empty($data['email'])) {
    send_json_response(false, "Email is required.", null, 400);
}

$email = trim($data['email']);

// Check both 'users' and 'pre_registered_users' tables
$user_found = false;
$name = "User";

// 1. Check main users table
$sql = "SELECT full_name FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if ($user = $res->fetch_assoc()) {
    $user_found = true;
    $name = $user['full_name'];
}

// 2. Check pre-registered table if not found yet
if (!$user_found) {
    $sql = "SELECT firstname FROM pre_registered_users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($user = $res->fetch_assoc()) {
        $user_found = true;
        $name = $user['firstname'];
    }
}

if ($user_found) {
    $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
    
    // In a real app, you would store this code in a 'password_resets' table with an expiry time.
    // For this prototype, we simulate the success if the email exists.
    $subject = "SIAT Password Reset Code: $code";
    $message = "
    <html>
    <head><title>Password Reset</title></head>
    <body style='font-family: Arial, sans-serif;'>
        <div style='max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
            <h2 style='color: #126035;'>Hello $name,</h2>
            <p>You requested a password reset for your SIAT account.</p>
            <p>Your temporary reset code is:</p>
            <div style='background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #126035;'>$code</div>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    </body>
    </html>";

    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: SIAT Support <noreply@siat.gov.ng>' . "\r\n";

    $sent = mail($email, $subject, $message, $headers);

    send_json_response(true, "A reset code has been sent to your email." . ($sent ? "" : " (Email delivery simulation)"), ["email" => $email]);
} else {
    // For security, don't confirm if the email exists or not, but for prototype we can be helpful.
    send_json_response(false, "No account found with that email address.", null, 404);
}
?>
