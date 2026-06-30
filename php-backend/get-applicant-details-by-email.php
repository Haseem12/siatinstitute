<?php
/**
 * FETCH APPLICANT DATA BY EMAIL
 * 
 * Look up appId by email, then fetch all related application data.
 */

require_once 'db_connect.php';

$email = $_GET['email'] ?? null;
if (!$email) send_json_response(false, "Email required.", null, 400);

// 1. Find App ID
$app_id = null;
$u_sql = "SELECT student_matric_no FROM users WHERE email = ? AND role = 'student'";
$stmt = $conn->prepare($u_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$res = $stmt->get_result();
if($row = $res->fetch_assoc()) $app_id = $row['student_matric_no'];
$stmt->close();

if(!$app_id) {
    $p_sql = "SELECT app_id FROM pre_registered_users WHERE email = ?";
    $stmt = $conn->prepare($p_sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if($row = $res->fetch_assoc()) $app_id = $row['app_id'];
    $stmt->close();
}

if(!$app_id) send_json_response(true, "No record found.", null);

// 2. Fetch Full App Data
$sql = "SELECT * FROM applications WHERE application_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $app_id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();

if(!$applicant) {
    // Return minimal info if application form not yet submitted
    send_json_response(true, "Success", ["applicationId" => $app_id, "email" => $email, "admissionStatus" => "Not Submitted"]);
}

// 3. Fetch Nested Data (O-Levels, etc.)
$id = $applicant['id'];
$applicant['oLevels'] = [];
$ol_sql = "SELECT * FROM o_level_qualifications WHERE application_db_id = ?";
$ol_stmt = $conn->prepare($ol_sql);
$ol_stmt->bind_param("i", $id);
$ol_stmt->execute();
$ol_res = $ol_stmt->get_result();
while($ol = $ol_res->fetch_assoc()) {
    $subjects = [];
    $s_sql = "SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = ?";
    $s_stmt = $conn->prepare($s_sql);
    $s_stmt->bind_param("i", $ol['id']);
    $s_stmt->execute();
    $s_res = $s_stmt->get_result();
    while($s = $s_res->fetch_assoc()) $subjects[] = $s;
    $ol['subjects'] = $subjects;
    $applicant['oLevels'][] = $ol;
}
// ... similar logic for aLevels and experiences ...

send_json_response(true, "Success", $applicant);
?>