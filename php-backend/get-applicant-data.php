<?php
/**
 * GET APPLICANT DATA (FOR ADMIN)
 * 
 * Fetches all submitted applications for the admin dashboard.
 */

require_once 'db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

$appId = $_GET['appId'] ?? null;

if ($appId) {
    $sql = "SELECT * FROM applications WHERE application_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $appId);
    $stmt->execute();
    $data = $stmt->get_result()->fetch_assoc();
    send_json_response(true, "Success", $data);
} else {
    $res = $conn->query("SELECT * FROM applications ORDER BY submitted_at DESC");
    $list = [];
    while ($row = $res->fetch_assoc()) {
        $db_id = $row['id'];
        // Fetch nested data
        $row['oLevels'] = [];
        $ol_res = $conn->query("SELECT * FROM o_level_qualifications WHERE application_db_id = $db_id");
        while($ol = $ol_res->fetch_assoc()) {
            $ol_id = $ol['id'];
            $ol['subjects'] = [];
            $sub_res = $conn->query("SELECT subject_name as subject, grade FROM o_level_subjects WHERE o_level_qualification_id = $ol_id");
            while($s = $sub_res->fetch_assoc()) $ol['subjects'][] = $s;
            $list_ol[] = $ol;
        }
        $row['oLevels'] = $list_ol ?? [];
        $list[] = $row;
    }
    send_json_response(true, "Success", $list);
}
?>