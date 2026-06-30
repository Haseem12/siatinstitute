<?php
/**
 * FETCH APPLICANT DATA BY EMAIL
 * 
 * Look up application details using user email.
 */

require_once 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$email = $_GET['email'] ?? null;
if (!$email) send_json_response(false, "Email required.", null, 400);

// Find Application ID
$app_id = null;
$u_sql = "SELECT student_matric_no FROM users WHERE email = ? AND role = 'student'";
$stmt = $conn->prepare($u_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
if($row = $stmt->get_result()->fetch_assoc()) $app_id = $row['student_matric_no'];

if(!$app_id) {
    $p_sql = "SELECT app_id FROM pre_registered_users WHERE email = ?";
    $stmt = $conn->prepare($p_sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    if($row = $stmt->get_result()->fetch_assoc()) $app_id = $row['app_id'];
}

if(!$app_id) send_json_response(true, "No record found.", null);

// Fetch full details
$sql = "SELECT * FROM applications WHERE application_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $app_id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();

if(!$applicant) {
    send_json_response(true, "Success", ["applicationId" => $app_id, "email" => $email, "admissionStatus" => "Not Submitted"]);
}

// Map nested data as needed
$applicant['oLevels'] = []; // Add logic here to fetch from related tables
$applicant['aLevels'] = [];
$applicant['experiences'] = [];

send_json_response(true, "Success", $applicant);
?>