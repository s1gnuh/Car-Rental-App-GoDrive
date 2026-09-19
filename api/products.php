<?php
require_once __DIR__ . "/_helpers.php";

$file = "cars.json";
$method = method();
$action = action();

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
    $data = body_json();
    $newCar = [
        "id" => next_id($cars),
        "name" => $data["name"] ?? "",
        "brand" => $data["brand"] ?? "",
        "type" => $data["type"] ?? "Sedan",
        "seats" => (int)($data["seats"] ?? 5),
        "price" => (int)($data["price"] ?? 0),
        "location" => $data["location"] ?? "Hà Nội",
        "status" => "available",
        "rating" => (float)($data["rating"] ?? 4.8),
        "featured" => !empty($data["featured"]),
        "image" => trim($data["image"] ?? "")
    ];
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
    $data = body_json();
    $cars[$idx] = array_merge($cars[$idx], $data);
    $cars[$idx]["id"] = $id;
    if (isset($data["price"])) $cars[$idx]["price"] = (int)$data["price"];
    if (isset($data["seats"])) $cars[$idx]["seats"] = (int)$data["seats"];
    if (array_key_exists("image", $data)) {
        $cars[$idx]["image"] = trim((string)$data["image"]);
    }
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
    if (!empty($data["status"])) $cars[$idx]["status"] = $data["status"];
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
