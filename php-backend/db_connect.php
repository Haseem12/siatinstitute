<?php
/**
 * FOUNDATIONAL CONNECTION SCRIPT
 * 
 * This file handles the database connection and provides a helper function
 * for consistent JSON responses. Include this at the top of all API scripts.
 */

// Database configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
$host = "localhost"; 
$db_user = "YOUR_DATABASE_USER";
$db_pass = "YOUR_DATABASE_PASSWORD";
$db_name = "YOUR_DATABASE_NAME";

// Create connection
$conn = new mysqli($host, $db_user, $db_pass, $db_name);

// Set charset to utf8mb4 for full character support (emojis, symbols)
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
 * Helper function to send a standard JSON response and terminate the script.
 * 
 * @param bool $success Whether the operation was successful.
 * @param string $message A descriptive message for the user/frontend.
 * @param mixed $data Optional data to return in the response.
 * @param int $http_code The HTTP status code (default 200).
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
?>