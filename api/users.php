<?php
require_once __DIR__ . "/_helpers.php";

$method = method();
$action = action();

if ($action === "payments") {
    require_auth();
    if ($method === "GET") {
        respond(payments_visible(read_json("payments.json"), read_json("bookings.json")));
    }
    if ($method === "PATCH") {
        // Cập nhật thủ công: xác nhận đã thu tiền / đổi hình thức thanh toán
        $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
        $list = read_json("payments.json");
        $idx = -1;
        foreach ($list as $i => $p) {
            if ((int)$p["id"] === $id) { $idx = $i; break; }
        }
        if ($idx < 0) fail("Không tìm thấy giao dịch", 404);
        $data = body_json();
        if (array_key_exists("method", $data)) {
            $list[$idx]["method"] = require_enum($data["method"], PAYMENT_METHODS, "Hình thức thanh toán");
        }
        if (array_key_exists("status", $data)) {
            $new = require_enum($data["status"], PAYMENT_STATUSES, "Trạng thái thanh toán");
            if ($new === "paid" && ($list[$idx]["status"] ?? "") !== "paid") $list[$idx]["paidAt"] = date("Y-m-d H:i");
            if ($new === "pending") $list[$idx]["paidAt"] = "";
            if ($new === "refunded") $list[$idx]["refundedAt"] = date("Y-m-d H:i");
            $list[$idx]["status"] = $new;
        }
        if (array_key_exists("note", $data)) $list[$idx]["note"] = clean_str($data["note"], 120);
        write_json("payments.json", $list);
        respond($list[$idx]);
    }
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
        $carId = (int)($data["carId"] ?? 0);
        $car = null;
        foreach (read_json("cars.json") as $c) {
            if ((int)$c["id"] === $carId) { $car = $c; break; }
        }
        if (!$car) fail("Không tìm thấy xe", 404);
        $startDate = $data["startDate"] ?? date("Y-m-d");
        $endDate = $data["endDate"] ?? date("Y-m-d");
        if (!valid_date($startDate) || !valid_date($endDate) || $endDate < $startDate) fail("Ngày bảo trì không hợp lệ");
        $cost = (int)($data["cost"] ?? 0);
        if ($cost < 0) fail("Chi phí không hợp lệ");
        $newItem = [
            "id" => next_id($list),
            "carId" => $carId,
            "carName" => $car["name"],
            "type" => clean_str($data["type"] ?? "", 100),
            "cost" => $cost,
            "startDate" => $startDate,
            "endDate" => $endDate,
            "status" => require_enum($data["status"] ?? "scheduled", MAINT_STATUSES, "Trạng thái"),
            "note" => clean_str($data["note"] ?? "", 500)
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
        $update = [];
        if (array_key_exists("type", $data)) $update["type"] = clean_str($data["type"], 100);
        if (array_key_exists("note", $data)) $update["note"] = clean_str($data["note"], 500);
        if (array_key_exists("cost", $data)) {
            $update["cost"] = (int)$data["cost"];
            if ($update["cost"] < 0) fail("Chi phí không hợp lệ");
        }
        foreach (["startDate", "endDate"] as $key) {
            if (array_key_exists($key, $data)) {
                if (!valid_date($data[$key])) fail("Ngày bảo trì không hợp lệ");
                $update[$key] = $data[$key];
            }
        }
        if (array_key_exists("status", $data)) {
            $update["status"] = require_enum($data["status"], MAINT_STATUSES, "Trạng thái");
        }
        $list[$idx] = array_merge($list[$idx], $update);

        $status = $update["status"] ?? "";
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
    // Hạng được tính lại từ tổng tiền thuê, kèm thứ hạng theo mức chi tiêu
    respond(customers_with_rank(read_json("customers.json")));
}

fail("Không hỗ trợ yêu cầu này", 405);
