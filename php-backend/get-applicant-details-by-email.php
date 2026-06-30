<?php
/**
 * FETCH APPLICANT DATA BY EMAIL (COMPLETE)
 * 
 * Look up application details using user email.
 * This script joins data from applications, o_levels, a_levels, and experiences.
 */

require_once 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$email = $_GET['email'] ?? null;
if (!$email) send_json_response(false, "Email required.", null, 400);

// 1. Find the Application ID (or Student Matric) associated with this email
$app_id = null;
$full_name_fallback = "";

// Check users table first
$u_sql = "SELECT student_matric_no, full_name FROM users WHERE email = ? AND role = 'student' LIMIT 1";
$stmt = $conn->prepare($u_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$u_res = $stmt->get_result();
if($row = $u_res->fetch_assoc()) {
    $app_id = $row['student_matric_no'];
    $full_name_fallback = $row['full_name'];
}

// If not in users, check pre_registered_users
if(!$app_id) {
    $p_sql = "SELECT app_id, surname, firstname, othername FROM pre_registered_users WHERE email = ? LIMIT 1";
    $stmt = $conn->prepare($p_sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $p_res = $stmt->get_result();
    if($row = $p_res->fetch_assoc()) {
        $app_id = $row['app_id'];
        $full_name_fallback = trim($row['surname'] . " " . $row['firstname'] . " " . $row['othername']);
    }
}

if(!$app_id) send_json_response(false, "No account record found for this email.", null, 404);

// 2. Fetch main application record
$sql = "SELECT * FROM applications WHERE application_id = ? LIMIT 1";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $app_id);
$stmt->execute();
$applicant = $stmt->get_result()->fetch_assoc();

if(!$applicant) {
    // Return minimal info so frontend knows the account exists but no form submitted yet
    send_json_response(true, "No submitted application found yet.", [
        "applicationId" => $app_id, 
        "email" => $email, 
        "fullName" => $full_name_fallback,
        "admissionStatus" => "Not Submitted"
    ]);
}

$db_id = $applicant['id'];

// 3. Fetch O-Levels
$applicant['oLevels'] = [];
$ol_res = $conn->query("SELECT * FROM o_level_qualifications WHERE application_db_id = $db_id");
while($ol = $ol_res->fetch_assoc()) {
    $ol_id = $ol['id'];
    $ol['subjects'] = [];
    $sub_res = $conn->query("SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = $ol_id");
    while($s = $sub_res->fetch_assoc()) $ol['subjects'][] = $s;
    $applicant['oLevels'][] = $ol;
}

// 4. Fetch A-Levels
$applicant['aLevels'] = [];
$al_res = $conn->query("SELECT * FROM a_level_qualifications WHERE application_db_id = $db_id");
while($al = $al_res->fetch_assoc()) {
    $applicant['aLevels'][] = $al;
}

// 5. Fetch Experiences
$applicant['experiences'] = [];
$ex_res = $conn->query("SELECT * FROM experiences WHERE application_db_id = $db_id");
while($ex = $ex_res->fetch_assoc()) {
    $applicant['experiences'][] = $ex;
}

send_json_response(true, "Success", $applicant);
?>
