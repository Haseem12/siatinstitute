<?php
/**
 * GET APPLICANT DATA (FOR ADMIN)
 * 
 * Fetches all submitted applications for the admin dashboard.
 * Correctly resets nested arrays to prevent data leaking between records.
 */

require_once 'db_connect.php';

// Handle CORS
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type");
    http_response_code(204);
    exit;
}

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$appId = $_GET['appId'] ?? null;

if ($appId) {
    // Single applicant fetch
    $sql = "SELECT * FROM applications WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $appId);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();
    
    if ($data) {
        $db_id = $data['id'];
        
        // Fetch O-Levels
        $data['oLevels'] = [];
        $ol_res = $conn->query("SELECT * FROM o_level_qualifications WHERE application_db_id = $db_id");
        while($ol = $ol_res->fetch_assoc()) {
            $ol_id = $ol['id'];
            $ol['subjects'] = [];
            $sub_res = $conn->query("SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = $ol_id");
            while($s = $sub_res->fetch_assoc()) $ol['subjects'][] = $s;
            $data['oLevels'][] = $ol;
        }
        
        // Fetch A-Levels
        $data['aLevels'] = [];
        $al_res = $conn->query("SELECT * FROM a_level_qualifications WHERE application_db_id = $db_id");
        while($al = $al_res->fetch_assoc()) $data['aLevels'][] = $al;
        
        // Fetch Experiences
        $data['experiences'] = [];
        $ex_res = $conn->query("SELECT * FROM experiences WHERE application_db_id = $db_id");
        while($ex = $ex_res->fetch_assoc()) $data['experiences'][] = $ex;
    }
    
    send_json_response(true, "Success", $data);
} else {
    // List all applicants
    $res = $conn->query("SELECT * FROM applications ORDER BY submitted_at DESC");
    $list = [];
    while ($row = $res->fetch_assoc()) {
        $db_id = $row['id'];
        
        // Initialize O-Levels array for this student specifically
        $row_oLevels = [];
        $ol_res = $conn->query("SELECT * FROM o_level_qualifications WHERE application_db_id = $db_id");
        if ($ol_res) {
            while($ol = $ol_res->fetch_assoc()) {
                $ol_id = $ol['id'];
                $ol['subjects'] = [];
                $sub_res = $conn->query("SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = $ol_id");
                if ($sub_res) {
                    while($s = $sub_res->fetch_assoc()) $ol['subjects'][] = $s;
                }
                $row_oLevels[] = $ol;
            }
        }
        $row['oLevels'] = $row_oLevels;
        
        // Add more nested fields if needed for the list view, though list usually needs less
        $list[] = $row;
    }
    send_json_response(true, "Success", $list);
}
?>