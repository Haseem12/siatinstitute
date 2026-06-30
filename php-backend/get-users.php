<?php
/**
 * GET ALL USERS
 * 
 * Fetches all records from the 'users' table.
 */

require_once 'db_connect.php';

// Handle CORS Preflight
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$sql = "SELECT id, email, full_name, role, staff_id, student_matric_no, department, level FROM users ORDER BY created_at DESC";
$result = $conn->query($sql);

if ($result) {
    $users = [];
    while ($row = $result->fetch_assoc()) {
        $users[] = $row;
    }
    send_json_response(true, "Users fetched successfully.", $users);
} else {
    send_json_response(false, "Failed to fetch users: " . $conn->error, null, 500);
}
?>
