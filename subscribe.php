<?php
/* ── MailerLite subscriber endpoint ─────────────────────────────
 *
 * Setup:
 * 1. MailerLite → Settings → Integrations → API → Generate token
 * 2. MailerLite → Subscribers → Groups → create "Worksheet Subscribers" → copy ID
 * 3. Fill in MAILERLITE_API_TOKEN and MAILERLITE_GROUP_ID below
 * 4. MailerLite → Automation → New → trigger: "When subscriber joins group"
 *    → Add step: Send email → include PDF link in the email body
 *
 * ─────────────────────────────────────────────────────────────── */

define('MAILERLITE_API_TOKEN', 'YOUR_API_TOKEN');
define('MAILERLITE_GROUP_ID',  'YOUR_GROUP_ID');

/* ── CORS — only allow requests from your own domain ─────────── */
$allowed_origins = ['https://styledbynanayaa.com', 'http://localhost'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit; }

/* ── Validate email ──────────────────────────────────────────── */
$body  = json_decode(file_get_contents('php://input'), true);
$email = filter_var($body['email'] ?? '', FILTER_VALIDATE_EMAIL);

if (!$email) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email address']);
    exit;
}

/* ── Call MailerLite API ─────────────────────────────────────── */
$payload = json_encode([
    'email'  => $email,
    'groups' => [MAILERLITE_GROUP_ID],
    'status' => 'active'
]);

$ch = curl_init('https://connect.mailerlite.com/api/subscribers');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Bearer ' . MAILERLITE_API_TOKEN,
    ],
]);

$response = curl_exec($ch);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

/* 200 = updated existing, 201 = new subscriber */
if ($status === 200 || $status === 201) {
    http_response_code(200);
    echo json_encode(['success' => true]);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'Could not subscribe. Please try again.']);
}
