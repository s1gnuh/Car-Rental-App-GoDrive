<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

define("DATA_DIR", dirname(__DIR__) . DIRECTORY_SEPARATOR . "data");
define("JWT_SECRET", "goride-secret-key-2024");

function ensure_data_dir() {
    if (!is_dir(DATA_DIR)) {
        mkdir(DATA_DIR, 0777, true);
    }
}

function json_path($file) {
    return DATA_DIR . DIRECTORY_SEPARATOR . $file;
}

function read_json($file) {
    ensure_data_dir();
    $path = json_path($file);
    if (!file_exists($path)) {
        return [];
    }
    $raw = file_get_contents($path);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function write_json($file, $data) {
    ensure_data_dir();
    file_put_contents(
        json_path($file),
        json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
    );
}

function body_json() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function respond($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($message, $code = 400) {
    respond(["error" => $message], $code);
}

function next_id($arr) {
    $max = 0;
    foreach ($arr as $item) {
        $id = isset($item["id"]) ? (int)$item["id"] : 0;
        if ($id > $max) $max = $id;
    }
    return $max + 1;
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), "+/", "-_"), "=");
}

function base64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat("=", 4 - $remainder);
    }
    return base64_decode(strtr($data, "-_", "+/"));
}

function make_token($payload) {
    $payload["exp"] = time() + 7 * 24 * 3600;
    $body = base64url_encode(json_encode($payload));
    $sig = base64url_encode(hash_hmac("sha256", $body, JWT_SECRET, true));
    return $body . "." . $sig;
}

function verify_token($token) {
    $parts = explode(".", $token);
    if (count($parts) !== 2) return null;
    [$body, $sig] = $parts;
    $expected = base64url_encode(hash_hmac("sha256", $body, JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return null;
    $payload = json_decode(base64url_decode($body), true);
    if (!is_array($payload)) return null;
    if (!isset($payload["exp"]) || $payload["exp"] < time()) return null;
    return $payload;
}

function bearer_token() {
    $header = "";
    if (isset($_SERVER["HTTP_AUTHORIZATION"])) {
        $header = $_SERVER["HTTP_AUTHORIZATION"];
    } elseif (isset($_SERVER["REDIRECT_HTTP_AUTHORIZATION"])) {
        $header = $_SERVER["REDIRECT_HTTP_AUTHORIZATION"];
    } elseif (function_exists("apache_request_headers")) {
        $headers = apache_request_headers();
        foreach ($headers as $k => $v) {
            if (strtolower($k) === "authorization") {
                $header = $v;
                break;
            }
        }
    }
    if (stripos($header, "Bearer ") === 0) {
        return trim(substr($header, 7));
    }
    return null;
}

function require_auth() {
    $token = bearer_token();
    if (!$token) fail("Chưa đăng nhập", 401);
    $admin = verify_token($token);
    if (!$admin) fail("Token không hợp lệ", 401);
    return $admin;
}

function method() {
    return strtoupper($_SERVER["REQUEST_METHOD"] ?? "GET");
}

function action() {
    return isset($_GET["action"]) ? $_GET["action"] : "";
}
