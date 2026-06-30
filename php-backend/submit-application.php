<?php
/**
 * SUBMIT APPLICATION
 * 
 * Saves the full application form data into 'applications' and related tables.
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

$appId = $data['applicationId'] ?? null;
if (!$appId) send_json_response(false, "Application ID is required.", null, 400);

// 1. Insert/Update applications table
$sql = "INSERT INTO applications (
            application_id, full_name, email, phone_number, date_of_birth, gender, 
            address, city, state_of_origin, nationality, photograph_name, photograph_type, photograph_size,
            next_of_kin_name, next_of_kin_phone, next_of_kin_relationship,
            preferred_program, preferred_campus, entry_mode, admission_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')
        ON DUPLICATE KEY UPDATE 
            full_name=VALUES(full_name), phone_number=VALUES(phone_number), 
            date_of_birth=VALUES(date_of_birth), gender=VALUES(gender), address=VALUES(address),
            city=VALUES(city), state_of_origin=VALUES(state_of_origin), photograph_name=VALUES(photograph_name),
            admission_status='Pending', submitted_at=CURRENT_TIMESTAMP";

$stmt = $conn->prepare($sql);
$dob = isset($data['dateOfBirth']) ? date('Y-m-d', strtotime($data['dateOfBirth'])) : null;
$photo = $data['photograph'] ?? null;

$stmt->bind_param("sssssssssssssssssss", 
    $appId, $data['fullName'], $data['email'], $data['phoneNumber'], $dob, $data['gender'],
    $data['address'], $data['city'], $data['stateOfOrigin'], $data['nationality'],
    $photo['name'], $photo['type'], $photo['size'],
    $data['nextOfKinName'], $data['nextOfKinPhone'], $data['nextOfKinRelationship'],
    $data['preferredProgram'], $data['preferredCampus'], $data['entryMode']
);

if ($stmt->execute()) {
    $db_id = $stmt->insert_id ?: 0;
    if (!$db_id) {
        $r = $conn->query("SELECT id FROM applications WHERE application_id = '$appId'");
        if ($row = $r->fetch_assoc()) $db_id = $row['id'];
    }

    // 2. Handle O-Levels
    if ($db_id && !empty($data['oLevels'])) {
        $conn->query("DELETE FROM o_level_qualifications WHERE application_db_id = $db_id");
        foreach ($data['oLevels'] as $ol) {
            $ol_sql = "INSERT INTO o_level_qualifications (application_db_id, exam_type, exam_year, exam_number, certificate_file_name, certificate_file_type, certificate_file_size) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $ol_stmt = $conn->prepare($ol_sql);
            $file = $ol['file'] ?? null;
            $ol_stmt->bind_param("issssss", $db_id, $ol['examType'], $ol['examYear'], $ol['examNumber'], $file['name'], $file['type'], $file['size']);
            $ol_stmt->execute();
            $ol_id = $ol_stmt->insert_id;
            
            if (!empty($ol['subjects'])) {
                foreach ($ol['subjects'] as $sub) {
                    $sub_sql = "INSERT INTO o_level_subjects (o_level_qualification_id, subject_name, grade) VALUES (?, ?, ?)";
                    $sub_stmt = $conn->prepare($sub_sql);
                    $sub_stmt->bind_param("iss", $ol_id, $sub['subject'], $sub['grade']);
                    $sub_stmt->execute();
                }
            }
        }
    }

    // Handle A-Levels and Experiences similarly...
    
    send_json_response(true, "Application submitted successfully.");
} else {
    send_json_response(false, "Error: " . $stmt->error, null, 500);
}
?>