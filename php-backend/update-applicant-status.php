<?php
/**
 * UPDATE APPLICANT STATUS
 * 
 * Admin tool to Admit or Decline an applicant.
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

if (!$data || empty($data['applicationId']) || empty($data['status'])) {
    send_json_response(false, "Invalid input.", null, 400);
}

$appId = $data['applicationId'];
$status = $data['status'];
$reason = $data['rejectionReason'] ?? null;
$admNo = $data['admissionNumber'] ?? null;

$sql = "UPDATE applications SET admission_status = ?, rejection_reason = ?, admission_number = ? WHERE application_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $status, $reason, $admNo, $appId);

if ($stmt->execute()) {
    send_json_response(true, "Status updated successfully.");
} else {
    send_json_response(false, "Error: " . $stmt->error, null, 500);
}
?>