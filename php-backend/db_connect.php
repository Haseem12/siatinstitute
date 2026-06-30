<?php
/**
 * FOUNDATIONAL CONNECTION SCRIPT
 * 
 * This file handles the database connection and provides helper functions
 * for consistent JSON responses and email sending.
 */

// --- GLOBAL CORS HANDLER ---
// This allows your React app (running on a different domain) to talk to your PHP server.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle Preflight (OPTIONS) requests immediately
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Database configuration
$host = "localhost"; 
$db_user = "sajfoods_siat";
$db_pass = "aYJE3SmYb2UjyAkgDpDc";
$db_name = "sajfoods_siat";

// Create connection
$conn = new mysqli($host, $db_user, $db_pass, $db_name);

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// Check connection
if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode([
        "success" => false,
        "message" => "Database Connection Failed: " . $conn->connect_error
    ]));
}

/**
 * Sends a standard JSON response and terminates the script.
 */
function send_json_response($success, $message, $data = null, $http_code = 200) {
    global $conn;
    http_response_code($http_code);
    echo json_encode([
        "success" => $success,
        "message" => $message,
        "data" => $data
    ]);
    if (isset($conn)) {
        $conn->close();
    }
    exit;
}

/**
 * Simple helper to send verification emails using PHP mail().
 */
function send_verification_email($to_email, $name, $code) {
    $subject = "Your SIAT Verification Code: $code";
    
    $message = "
    <html>
    <head>
        <title>SIAT Verification Code</title>
    </head>
    <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
        <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
            <h2 style='color: #126035;'>Welcome to SIAT, $name!</h2>
            <p>Thank you for pre-registering with the Scholars Institute of Arts & Technology, Zaria.</p>
            <p>Your 6-digit verification code is:</p>
            <div style='background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #126035; border-radius: 5px; margin: 20px 0;'>
                $code
            </div>
            <p>Please enter this code on the registration page to verify your email and continue your application.</p>
            <p>If you did not request this, please ignore this email.</p>
            <hr style='border: 0; border-top: 1px solid #eee; margin: 20px 0;'>
            <p style='font-size: 12px; color: #777; text-align: center;'>
                SIAT-Institute, Zaria. Km 5, Zaria-Kano Road, Zaria, Kaduna State.<br>
                This is an automated message, please do not reply.
            </p>
        </div>
    </body>
    </html>
    ";

    // Set content-type header for sending HTML email
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    
    // Additional headers
    $headers .= 'From: SIAT Institute <noreply@siat.gov.ng>' . "\r\n";
    $headers .= 'Reply-To: info@sajfoods.com.ng' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    return mail($to_email, $subject, $message, $headers);
}
?>