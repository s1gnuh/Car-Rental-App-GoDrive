<?php
require_once __DIR__ . "/_helpers.php";

$file = "cars.json";
$method = method();
$action = action();

// Lấy và kiểm tra các trường thông tin xe từ body (chỉ nhận các trường trong whitelist).
// $partial = true khi cập nhật: chỉ validate các trường được gửi lên.
function car_fields($data, $partial) {
    $out = [];
    if (!$partial || array_key_exists("name", $data)) {
        $out["name"] = clean_str($data["name"] ?? "", 100);
        if ($out["name"] === "") fail("Tên xe không được để trống");
    }
    if (!$partial || array_key_exists("brand", $data)) {
        $out["brand"] = clean_str($data["brand"] ?? "", 50);
    }
    if (!$partial || array_key_exists("type", $data)) {
        $out["type"] = require_enum($data["type"] ?? "Sedan", CAR_TYPES, "Loại xe");
    }
    if (!$partial || array_key_exists("seats", $data)) {
        $out["seats"] = (int)($data["seats"] ?? 5);
        if ($out["seats"] < 1 || $out["seats"] > 50) fail("Số chỗ không hợp lệ");
    }
    if (!$partial || array_key_exists("price", $data)) {
        $out["price"] = (int)($data["price"] ?? 0);
        if ($out["price"] <= 0 || $out["price"] > 1000000000) fail("Giá thuê không hợp lệ");
    }
    if (!$partial || array_key_exists("location", $data)) {
        $out["location"] = clean_str($data["location"] ?? "Hà Nội", 100);
        if ($out["location"] === "") fail("Địa điểm không được để trống");
    }
    if (!$partial || array_key_exists("rating", $data)) {
        $out["rating"] = max(0, min(5, (float)($data["rating"] ?? 4.8)));
    }
    if (!$partial || array_key_exists("featured", $data)) {
        $out["featured"] = !empty($data["featured"]);
    }
    if (!$partial || array_key_exists("image", $data)) {
        $out["image"] = clean_image_url($data["image"] ?? "");
    }
    return $out;
}

if ($method === "GET") {
    $cars = read_json($file);
    $status = $_GET["status"] ?? "";
    $location = $_GET["location"] ?? "";
    $type = $_GET["type"] ?? "";
    if ($status !== "") {
        $cars = array_values(array_filter($cars, fn($c) => ($c["status"] ?? "") === $status));
    }
    if ($location !== "") {
        $cars = array_values(array_filter($cars, fn($c) => ($c["location"] ?? "") === $location));
    }
    if ($type !== "") {
        $cars = array_values(array_filter($cars, fn($c) => ($c["type"] ?? "") === $type));
    }
    respond($cars);
}

if ($method === "POST") {
    require_auth();
    $cars = read_json($file);
    $newCar = array_merge(
        ["rating" => 4.8, "featured" => false, "image" => ""],
        car_fields(body_json(), false)
    );
    $newCar["id"] = next_id($cars);
    $newCar["status"] = "available";
    $cars[] = $newCar;
    write_json($file, $cars);
    respond($newCar);
}

if ($method === "PUT") {
    require_auth();
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
    $cars = read_json($file);
    $idx = -1;
    foreach ($cars as $i => $c) {
        if ((int)$c["id"] === $id) { $idx = $i; break; }
    }
    if ($idx < 0) fail("Không tìm thấy xe", 404);
    $cars[$idx] = array_merge($cars[$idx], car_fields(body_json(), true));
    $cars[$idx]["id"] = $id;
    write_json($file, $cars);
    respond($cars[$idx]);
}

if ($method === "PATCH" && $action === "status") {
    require_auth();
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
    $cars = read_json($file);
    $idx = -1;
    foreach ($cars as $i => $c) {
        if ((int)$c["id"] === $id) { $idx = $i; break; }
    }
    if ($idx < 0) fail("Không tìm thấy xe", 404);
    $data = body_json();
    $cars[$idx]["status"] = require_enum($data["status"] ?? "", CAR_STATUSES, "Trạng thái");
    write_json($file, $cars);
    respond($cars[$idx]);
}

if ($method === "DELETE") {
    require_auth();
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
    $cars = array_values(array_filter(read_json($file), fn($c) => (int)$c["id"] !== $id));
    write_json($file, $cars);
    respond(["success" => true]);
}

fail("Không hỗ trợ yêu cầu này", 405);
