<?php
require_once __DIR__ . "/_helpers.php";

$bookingsFile = "bookings.json";
$carsFile = "cars.json";
$customersFile = "customers.json";
$method = method();
$action = action();

if ($method === "GET" && $action === "lookup") {
    // Khách không có tài khoản nên phải khớp CẢ email lẫn số điện thoại của cùng một đơn,
    // tránh việc chỉ cần biết một thông tin là xem được đơn của người khác.
    $email = clean_str($_GET["email"] ?? "", 150);
    $phone = clean_str($_GET["phone"] ?? "", 20);
    if ($email === "" || $phone === "") fail("Cần nhập cả email và số điện thoại đã dùng khi đặt");

    $phoneNorm = preg_replace("/[\s.()-]+/", "", $phone);
    $bookings = read_json($bookingsFile);
    $result = array_values(array_filter($bookings, function ($b) use ($email, $phoneNorm) {
        $matchEmail = isset($b["customerEmail"])
            && strtolower($b["customerEmail"]) === strtolower($email);
        $matchPhone = isset($b["customerPhone"])
            && preg_replace("/[\s.()-]+/", "", $b["customerPhone"]) === $phoneNorm;
        return $matchEmail && $matchPhone;
    }));
    usort($result, fn($a, $b) => (int)$b["id"] - (int)$a["id"]);

    // Thông tin hạng thành viên: chỉ trả về khi email + số điện thoại đã khớp ít nhất một đơn
    $member = null;
    if ($result) {
        $ranked = customers_with_rank(read_json($customersFile));
        $idx = find_customer_index($ranked, $email, $phone);
        if ($idx >= 0) {
            $c = $ranked[$idx];
            $member = [
                "name" => $c["name"] ?? "",
                "totalSpent" => $c["totalSpent"],
                "totalBookings" => (int)($c["totalBookings"] ?? 0),
                "tier" => $c["tier"],
                "rank" => $c["rank"],
                "totalCustomers" => count($ranked)
            ];
        }
    }
    respond(["bookings" => $result, "member" => $member]);
}

if ($method === "GET") {
    require_auth();
    $bookings = read_json($bookingsFile);
    usort($bookings, fn($a, $b) => (int)$b["id"] - (int)$a["id"]);
    respond($bookings);
}

if ($method === "POST" && $action === "") {
    $body = body_json();
    $customerName = preg_replace('/\s+/u', " ", clean_str($body["customerName"] ?? "", 100));
    $customerEmail = clean_str($body["customerEmail"] ?? "", 150);
    $customerPhone = clean_str($body["customerPhone"] ?? "", 20);
    $carId = (int)($body["carId"] ?? 0);
    $startDate = $body["startDate"] ?? "";
    $endDate = $body["endDate"] ?? "";
    $location = clean_str($body["location"] ?? "", 100);

    if (!$customerName || !$customerEmail || !$customerPhone || !$carId || !$startDate || !$endDate) {
        fail("Thiếu thông tin đặt xe");
    }
    if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) fail("Email không hợp lệ");
    if (!valid_name($customerName)) fail("Họ tên chỉ được chứa chữ cái");
    if (!valid_phone($customerPhone)) fail("Số điện thoại chỉ được gồm 9-10 chữ số");
    if (!valid_date($startDate) || !valid_date($endDate)) fail("Ngày không hợp lệ");
    if ($startDate < date("Y-m-d")) fail("Ngày nhận xe không được ở quá khứ");
    if ($endDate <= $startDate) fail("Ngày trả xe phải sau ngày nhận xe");
    if ((strtotime($endDate) - strtotime($startDate)) / 86400 > 90) fail("Thời gian thuê tối đa 90 ngày");

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

    // Đếm số đơn ngay khi đặt; tiền thuê chỉ được cộng khi admin xác nhận đơn (xem phần PATCH)
    $customers = read_json($customersFile);
    $ci = find_customer_index($customers, $customerEmail, $customerPhone);
    if ($ci >= 0) {
        $customers[$ci]["totalBookings"] = ((int)($customers[$ci]["totalBookings"] ?? 0)) + 1;
    } else {
        $customers[] = [
            "id" => next_id($customers),
            "name" => $customerName,
            "email" => $customerEmail,
            "phone" => $customerPhone,
            "joinedAt" => date("Y-m-d"),
            "totalBookings" => 1,
            "totalSpent" => 0,
            "tier" => customer_tier(0)
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
        if (($bookings[$idx]["status"] ?? "") !== "confirmed") fail("Chỉ đơn đã xác nhận mới bàn giao xe được");
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
    require_enum($status, BOOKING_STATUSES, "Trạng thái");
    $oldStatus = $bookings[$idx]["status"] ?? "";
    $bookings[$idx]["status"] = $status;
    write_json($bookingsFile, $bookings);

    // Cập nhật tổng tiền thuê và hạng của khách: cộng khi đơn được xác nhận, trừ lại nếu đơn đã xác nhận bị hủy
    $delta = 0;
    if ($oldStatus !== "confirmed" && $status === "confirmed") $delta = (int)($bookings[$idx]["total"] ?? 0);
    if ($oldStatus === "confirmed" && $status !== "confirmed") $delta = -(int)($bookings[$idx]["total"] ?? 0);
    if ($delta !== 0) {
        $customers = read_json($customersFile);
        $ci = find_customer_index($customers, $bookings[$idx]["customerEmail"] ?? "", $bookings[$idx]["customerPhone"] ?? "");
        if ($ci >= 0) {
            $spent = max(0, (int)($customers[$ci]["totalSpent"] ?? 0) + $delta);
            $customers[$ci]["totalSpent"] = $spent;
            $customers[$ci]["tier"] = customer_tier($spent);
            write_json($customersFile, $customers);
        }
    }

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
