<?php
require_once __DIR__ . "/_helpers.php";

$bookingsFile = "bookings.json";
$carsFile = "cars.json";
$customersFile = "customers.json";
$method = method();
$action = action();

if ($method === "GET" && $action === "lookup") {
    $email = trim($_GET["email"] ?? "");
    $phone = trim($_GET["phone"] ?? "");
    if ($email === "" && $phone === "") fail("Cần email hoặc số điện thoại");

    $phoneNorm = preg_replace("/\s+/", "", $phone);
    $bookings = read_json($bookingsFile);
    $result = array_values(array_filter($bookings, function ($b) use ($email, $phoneNorm) {
        $matchEmail = $email !== "" && isset($b["customerEmail"])
            && strtolower($b["customerEmail"]) === strtolower($email);
        $matchPhone = $phoneNorm !== "" && isset($b["customerPhone"])
            && preg_replace("/\s+/", "", $b["customerPhone"]) === $phoneNorm;
        return $matchEmail || $matchPhone;
    }));
    usort($result, fn($a, $b) => (int)$b["id"] - (int)$a["id"]);
    respond($result);
}

if ($method === "GET") {
    require_auth();
    $bookings = read_json($bookingsFile);
    usort($bookings, fn($a, $b) => (int)$b["id"] - (int)$a["id"]);
    respond($bookings);
}

if ($method === "POST" && $action === "") {
    $body = body_json();
    $customerName = trim($body["customerName"] ?? "");
    $customerEmail = trim($body["customerEmail"] ?? "");
    $customerPhone = trim($body["customerPhone"] ?? "");
    $carId = (int)($body["carId"] ?? 0);
    $startDate = $body["startDate"] ?? "";
    $endDate = $body["endDate"] ?? "";
    $location = $body["location"] ?? "";

    if (!$customerName || !$customerEmail || !$customerPhone || !$carId || !$startDate || !$endDate) {
        fail("Thiếu thông tin đặt xe");
    }

    $cars = read_json($carsFile);
    $car = null;
    foreach ($cars as $c) {
        if ((int)$c["id"] === $carId) { $car = $c; break; }
    }
    if (!$car) fail("Không tìm thấy xe", 404);
    if (($car["status"] ?? "") !== "available") fail("Xe không khả dụng");

    $bookings = read_json($bookingsFile);
    foreach ($bookings as $b) {
        if ((int)$b["carId"] !== $carId) continue;
        if (!in_array($b["status"] ?? "", ["pending", "confirmed"], true)) continue;
        if (strtotime($startDate) < strtotime($b["endDate"]) && strtotime($endDate) > strtotime($b["startDate"])) {
            fail("Xe đã có đơn trong khoảng thời gian này");
        }
    }

    $days = max(1, (int)ceil((strtotime($endDate) - strtotime($startDate)) / 86400));
    $total = $days * (int)$car["price"];

    $newBooking = [
        "id" => (int)(microtime(true) * 1000),
        "userId" => null,
        "customerName" => $customerName,
        "customerEmail" => $customerEmail,
        "customerPhone" => $customerPhone,
        "carId" => $carId,
        "carName" => $car["name"],
        "startDate" => $startDate,
        "endDate" => $endDate,
        "location" => $location !== "" ? $location : ($car["location"] ?? ""),
        "total" => $total,
        "status" => "pending",
        "createdAt" => date("c")
    ];
    $bookings[] = $newBooking;
    write_json($bookingsFile, $bookings);

    $customers = read_json($customersFile);
    $found = false;
    foreach ($customers as &$customer) {
        if (
            strtolower($customer["email"] ?? "") === strtolower($customerEmail)
            || ($customer["phone"] ?? "") === $customerPhone
        ) {
            $customer["totalBookings"] = ((int)($customer["totalBookings"] ?? 0)) + 1;
            $customer["totalSpent"] = ((int)($customer["totalSpent"] ?? 0)) + $total;
            $found = true;
            break;
        }
    }
    unset($customer);
    if (!$found) {
        $customers[] = [
            "id" => next_id($customers),
            "name" => $customerName,
            "email" => $customerEmail,
            "phone" => $customerPhone,
            "joinedAt" => date("Y-m-d"),
            "totalBookings" => 1,
            "totalSpent" => $total,
            "tier" => "bronze"
        ];
    }
    write_json($customersFile, $customers);

    respond($newBooking);
}

if ($method === "PATCH") {
    require_auth();
    $id = isset($_GET["id"]) ? (int)$_GET["id"] : 0;
    $bookings = read_json($bookingsFile);
    $idx = -1;
    foreach ($bookings as $i => $b) {
        if ((int)$b["id"] === $id) { $idx = $i; break; }
    }
    if ($idx < 0) fail("Không tìm thấy đơn", 404);

    if ($action === "mark-rented") {
        $cars = read_json($carsFile);
        foreach ($cars as &$c) {
            if ((int)$c["id"] === (int)$bookings[$idx]["carId"]) {
                $c["status"] = "rented";
                break;
            }
        }
        unset($c);
        write_json($carsFile, $cars);
        respond(["success" => true]);
    }

    $data = body_json();
    $status = $data["status"] ?? "";
    if ($status === "") fail("Thiếu trạng thái");
    $bookings[$idx]["status"] = $status;
    write_json($bookingsFile, $bookings);

    if ($status === "cancelled") {
        $cars = read_json($carsFile);
        foreach ($cars as &$c) {
            if ((int)$c["id"] === (int)$bookings[$idx]["carId"] && ($c["status"] ?? "") === "rented") {
                $c["status"] = "available";
                break;
            }
        }
        unset($c);
        write_json($carsFile, $cars);
    }

    respond($bookings[$idx]);
}

fail("Không hỗ trợ yêu cầu này", 405);
