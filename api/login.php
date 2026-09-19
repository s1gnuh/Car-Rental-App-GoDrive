<?php
require_once __DIR__ . "/_helpers.php";

$adminsFile = "admins.json";
$method = method();
$action = action();

if ($method === "POST" && ($action === "" || $action === "login")) {
    $body = body_json();
    $username = trim($body["username"] ?? "");
    $password = $body["password"] ?? "";
    if ($username === "" || $password === "") fail("Thiếu thông tin");

    $admins = read_json($adminsFile);
    $admin = null;
    foreach ($admins as $a) {
        if ($a["username"] === $username) { $admin = $a; break; }
        if (!empty($a["email"]) && strtolower($a["email"]) === strtolower($username)) {
            $admin = $a; break;
        }
    }
    if (!$admin) fail("Tài khoản không tồn tại", 401);

    $hash = $admin["passwordHash"] ?? "";
    $ok = password_verify($password, $hash);
    // Fallback plain compare for seed/demo if hash missing
    if (!$ok && isset($admin["password"]) && $admin["password"] === $password) $ok = true;
    if (!$ok) fail("Sai mật khẩu", 401);

    $token = make_token(["id" => $admin["id"], "username" => $admin["username"]]);
    respond([
        "token" => $token,
        "admin" => [
            "id" => $admin["id"],
            "username" => $admin["username"],
            "name" => $admin["name"] ?? "",
            "email" => $admin["email"] ?? ""
        ]
    ]);
}

if ($method === "GET" && ($action === "" || $action === "me")) {
    $auth = require_auth();
    $admins = read_json($adminsFile);
    foreach ($admins as $a) {
        if ((int)$a["id"] === (int)$auth["id"]) {
            respond([
                "id" => $a["id"],
                "username" => $a["username"],
                "name" => $a["name"] ?? "",
                "email" => $a["email"] ?? "",
                "createdAt" => $a["createdAt"] ?? ""
            ]);
        }
    }
    fail("Không tìm thấy", 404);
}

if ($method === "POST" && $action === "change-password") {
    $auth = require_auth();
    $body = body_json();
    $oldPassword = $body["oldPassword"] ?? "";
    $newPassword = $body["newPassword"] ?? "";
    if ($oldPassword === "" || strlen($newPassword) < 6) {
        fail("Mật khẩu mới ít nhất 6 ký tự");
    }
    $admins = read_json($adminsFile);
    $idx = -1;
    foreach ($admins as $i => $a) {
        if ((int)$a["id"] === (int)$auth["id"]) { $idx = $i; break; }
    }
    if ($idx < 0) fail("Tài khoản không tồn tại", 404);
    if (!password_verify($oldPassword, $admins[$idx]["passwordHash"] ?? "")) {
        fail("Mật khẩu cũ sai");
    }
    $admins[$idx]["passwordHash"] = password_hash($newPassword, PASSWORD_BCRYPT);
    write_json($adminsFile, $admins);
    respond(["success" => true]);
}

if ($method === "GET" && $action === "admins") {
    require_auth();
    $list = array_map(function ($a) {
        return [
            "id" => $a["id"],
            "username" => $a["username"],
            "name" => $a["name"] ?? "",
            "email" => $a["email"] ?? "",
            "createdAt" => $a["createdAt"] ?? ""
        ];
    }, read_json($adminsFile));
    respond($list);
}

if ($method === "POST" && $action === "admins") {
    require_auth();
    $body = body_json();
    $username = trim($body["username"] ?? "");
    $password = $body["password"] ?? "";
    $name = trim($body["name"] ?? "");
    $email = trim($body["email"] ?? "");
    if ($username === "" || $password === "" || $name === "") fail("Thiếu thông tin");
    if (strlen($password) < 6) fail("Mật khẩu ít nhất 6 ký tự");

    $admins = read_json($adminsFile);
    foreach ($admins as $a) {
        if ($a["username"] === $username) fail("Username đã tồn tại");
        if ($email && !empty($a["email"]) && strtolower($a["email"]) === strtolower($email)) {
            fail("Email đã tồn tại");
        }
    }
    $newAdmin = [
        "id" => next_id($admins),
        "username" => $username,
        "name" => $name,
        "email" => $email,
        "passwordHash" => password_hash($password, PASSWORD_BCRYPT),
        "createdAt" => date("c")
    ];
    $admins[] = $newAdmin;
    write_json($adminsFile, $admins);
    respond([
        "id" => $newAdmin["id"],
        "username" => $newAdmin["username"],
        "name" => $newAdmin["name"],
        "email" => $newAdmin["email"]
    ]);
}

if ($method === "DELETE" && $action === "admins") {
    $auth = require_auth();
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
    $admins = read_json($adminsFile);
    if (count($admins) <= 1) fail("Phải giữ lại ít nhất 1 admin");
    $idx = -1;
    foreach ($admins as $i => $a) {
        if ((int)$a["id"] === $id) { $idx = $i; break; }
    }
    if ($idx < 0) fail("Không tìm thấy", 404);
    if ((int)$admins[$idx]["id"] === (int)$auth["id"]) fail("Không thể xóa chính mình");
    array_splice($admins, $idx, 1);
    write_json($adminsFile, $admins);
    respond(["success" => true]);
}

fail("Không hỗ trợ yêu cầu này", 405);
