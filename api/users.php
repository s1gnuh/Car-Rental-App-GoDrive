<?php
require_once __DIR__ . "/_helpers.php";

$method = method();
$action = action();

if ($action === "payments") {
    require_auth();
    if ($method === "GET") respond(read_json("payments.json"));
    fail("Không hỗ trợ yêu cầu này", 405);
}

if ($action === "maintenance") {
    require_auth();
    if ($method === "GET") {
        respond(read_json("maintenance.json"));
    }
    if ($method === "POST") {
        $list = read_json("maintenance.json");
        $data = body_json();
        $newItem = [
            "id" => next_id($list),
            "carId" => (int)($data["carId"] ?? 0),
            "carName" => $data["carName"] ?? "",
            "type" => $data["type"] ?? "",
            "cost" => (int)($data["cost"] ?? 0),
            "startDate" => $data["startDate"] ?? date("Y-m-d"),
            "endDate" => $data["endDate"] ?? date("Y-m-d"),
            "status" => $data["status"] ?? "scheduled",
            "note" => $data["note"] ?? ""
        ];
        $list[] = $newItem;
        write_json("maintenance.json", $list);
        respond($newItem);
    }
    if ($method === "PATCH") {
        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        $list = read_json("maintenance.json");
        $idx = -1;
        foreach ($list as $i => $m) {
            if ((int)$m["id"] === $id) { $idx = $i; break; }
        }
        if ($idx < 0) fail("Không tìm thấy", 404);
        $data = body_json();
        $list[$idx] = array_merge($list[$idx], $data);
        $list[$idx]["id"] = $id;
        if (isset($data["cost"])) $list[$idx]["cost"] = (int)$data["cost"];

        $status = $data["status"] ?? "";
        if ($status === "in_progress") {
            $cars = read_json("cars.json");
            foreach ($cars as &$c) {
                if ((int)$c["id"] === (int)$list[$idx]["carId"]) {
                    $c["status"] = "maintenance";
                    break;
                }
            }
            unset($c);
            write_json("cars.json", $cars);
        }
        if ($status === "completed") {
            $cars = read_json("cars.json");
            foreach ($cars as &$c) {
                if ((int)$c["id"] === (int)$list[$idx]["carId"] && ($c["status"] ?? "") === "maintenance") {
                    $c["status"] = "available";
                    break;
                }
            }
            unset($c);
            write_json("cars.json", $cars);
        }

        write_json("maintenance.json", $list);
        respond($list[$idx]);
    }
    if ($method === "DELETE") {
        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        $list = array_values(array_filter(read_json("maintenance.json"), fn($m) => (int)$m["id"] !== $id));
        write_json("maintenance.json", $list);
        respond(["success" => true]);
    }
    fail("Không hỗ trợ yêu cầu này", 405);
}

if ($method === "GET") {
    require_auth();
    respond(read_json("customers.json"));
}

fail("Không hỗ trợ yêu cầu này", 405);
