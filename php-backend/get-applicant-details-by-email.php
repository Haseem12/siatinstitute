<?php
/**
 * FETCH APPLICANT DATA BY EMAIL (COMPLETE)
 * 
 * Look up application details using user email.
 * This script joins data from applications, o_levels, a_levels, and experiences.
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

$email = $_GET['email'] ?? null;
if (!$email) send_json_response(false, "Email required.", null, 400);

// 1. Find the Application ID (or Student Matric) and Name components
$app_id = null;
$full_name_fallback = "";
$surname = "";
$firstname = "";
$othername = "";

// Check users table first (for admitted students)
$u_sql = "SELECT student_matric_no, full_name FROM users WHERE email = ? AND role = 'student' LIMIT 1";
$stmt = $conn->prepare($u_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$u_res = $stmt->get_result();
if($row = $u_res->fetch_assoc()) {
    $app_id = $row['student_matric_no'];
    $full_name_fallback = $row['full_name'];
}

// Always check pre_registered_users to get name components (surname, firstname)
$p_sql = "SELECT app_id, surname, firstname, othername FROM pre_registered_users WHERE email = ? LIMIT 1";
$stmt_p = $conn->prepare($p_sql);
$stmt_p->bind_param("s", $email);
$stmt_p->execute();
$p_res = $stmt_p->get_result();
if($row_p = $p_res->fetch_assoc()) {
    if (!$app_id) $app_id = $row_p['app_id'];
    $surname = $row_p['surname'];
    $firstname = $row_p['firstname'];
    $othername = $row_p['othername'];
    if (!$full_name_fallback) {
        $full_name_fallback = trim($surname . " " . $firstname . " " . $othername);
    }
}

if(!$app_id) send_json_response(false, "No account record found for this email.", null, 404);

// 2. Fetch main application record
$sql = "SELECT * FROM applications WHERE application_id = ? LIMIT 1";
$stmt_a = $conn->prepare($sql);
$stmt_a->bind_param("s", $app_id);
$stmt_a->execute();
$applicant = $stmt_a->get_result()->fetch_assoc();

if(!$applicant) {
    // Return minimal info so frontend knows the account exists but no form submitted yet
    send_json_response(true, "No submitted application found yet.", [
        "applicationId" => $app_id, 
        "email" => $email, 
        "fullName" => $full_name_fallback,
        "surname" => $surname,
        "firstname" => $firstname,
        "othername" => $othername,
        "admissionStatus" => "Not Submitted"
    ]);
}

$db_id = $applicant['id'];

// 3. Fetch O-Levels
$applicant['oLevels'] = [];
$ol_res = $conn->query("SELECT * FROM o_level_qualifications WHERE application_db_id = $db_id");
if ($ol_res) {
    while($ol = $ol_res->fetch_assoc()) {
        $ol_id = $ol['id'];
        $ol['subjects'] = [];
        $sub_res = $conn->query("SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = $ol_id");
        if ($sub_res) {
            while($s = $sub_res->fetch_assoc()) $ol['subjects'][] = $s;
        }
        $applicant['oLevels'][] = $ol;
    }
}

// 4. Fetch A-Levels
$applicant['aLevels'] = [];
$al_res = $conn->query("SELECT * FROM a_level_qualifications WHERE application_db_id = $db_id");
if ($al_res) {
    while($al = $al_res->fetch_assoc()) {
        $applicant['aLevels'][] = $al;
    }
}

// 5. Fetch Experiences
$applicant['experiences'] = [];
$ex_res = $conn->query("SELECT * FROM experiences WHERE application_db_id = $db_id");
if ($ex_res) {
    while($ex = $ex_res->fetch_assoc()) {
        $applicant['experiences'][] = $ex;
    }
}

// Add names for mapper if they are in pre_registered but not applications (unlikely but safe)
if (!isset($applicant['surname'])) $applicant['surname'] = $surname;
if (!isset($applicant['firstname'])) $applicant['firstname'] = $firstname;
if (!isset($applicant['othername'])) $applicant['othername'] = $othername;

send_json_response(true, "Success", $applicant);
?>