<?php
// api/orders.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    $trackId = $_GET['tracking_id'] ?? null;

    try {
        if ($trackId) {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE tracking_id = ?");
            $stmt->execute([$trackId]);
        } else if ($userId) {
            $stmt = $conn->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
        } else {
            $stmt = $conn->prepare("SELECT * FROM orders ORDER BY created_at DESC");
            $stmt->execute();
        }

        $orders = [];
        while ($row = $stmt->fetch()) {
            // Get order items for this order
            $itemStmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
            $itemStmt->execute([$row['id']]);
            $items = [];
            while ($item = $itemStmt->fetch()) {
                $item['toppings'] = json_decode($item['toppings']);
                $item['qty'] = (int)$item['qty'];
                $item['price'] = (float)$item['price'];
                $item['cakeId'] = $item['cake_id'];
                unset($item['cake_id']);
                $items[] = $item;
            }

            // Status history
            $histStmt = $conn->prepare("SELECT status, time FROM order_status_history WHERE order_id = ? ORDER BY time ASC");
            $histStmt->execute([$row['id']]);
            $history = $histStmt->fetchAll();
            // Fallback status history if none exists in table
            if (count($history) === 0) {
               $history = [["status" => "received", "time" => $row['created_at']]];
            }

            // Format order object to match frontend expectations
            $orders[] = [
                "id" => $row['id'],
                "trackingId" => $row['tracking_id'],
                "userId" => $row['user_id'],
                "subtotal" => (float)$row['subtotal'],
                "deliveryFee" => (float)$row['delivery_fee'],
                "tax" => (float)$row['tax'],
                "discount" => (float)$row['discount'],
                "total" => (float)$row['total'],
                "status" => $row['status'],
                "driverId" => $row['driver_id'],
                "couponCode" => $row['coupon_code'],
                "paymentMethod" => $row['payment_method'],
                "createdAt" => str_replace(' ', 'T', $row['created_at']) . 'Z',
                "delivery" => [
                    "address" => $row['delivery_address'],
                    "date" => $row['delivery_date'],
                    "time" => $row['delivery_time'],
                    "name" => $row['delivery_name'],
                    "phone" => $row['delivery_phone']
                ],
                "items" => $items,
                "statusHistory" => array_map(function($h) { 
                    return ["status" => $h['status'], "time" => str_replace(' ', 'T', $h['time']) . 'Z']; 
                }, $history)
            ];
        }

        if ($trackId && count($orders) > 0) {
            echo json_encode($orders[0]);
        } else {
            echo json_encode($orders);
        }

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} 
else if ($method === 'POST') {
    // Create new order
    $data = json_decode(file_get_contents("php://input"));
    
    try {
        $conn->beginTransaction();

        $orderId = 'ord_' . substr(md5(uniqid()), 0, 8);
        $trackingId = 'TRK-' . date('Y') . '-' . substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 6);
        
        // Default values to prevent null errors
        $subtotal = $data->subtotal ?? 0;
        $deliveryFee = $data->deliveryFee ?? 0;
        $tax = $data->tax ?? 0;
        $discount = $data->discount ?? 0;
        $total = $data->total ?? 0;
        $status = 'received';
        $userId = $data->userId ?? 'guest';
        
        $delivery = $data->delivery ?? new stdClass();
        $addr = $delivery->address ?? '';
        $date = $delivery->date ?? date('Y-m-d');
        $time = $delivery->time ?? '';
        $name = $delivery->name ?? '';
        $phone = $delivery->phone ?? '';
        
        $coupon = $data->couponCode ?? null;
        $pm = $data->paymentMethod ?? 'credit_card';

        // Insert Master
        $stmt = $conn->prepare("INSERT INTO orders (id, tracking_id, user_id, subtotal, delivery_fee, tax, discount, total, status, delivery_address, delivery_date, delivery_time, delivery_name, delivery_phone, coupon_code, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$orderId, $trackingId, $userId, $subtotal, $deliveryFee, $tax, $discount, $total, $status, $addr, $date, $time, $name, $phone, $coupon, $pm]);

        // Insert Items
        if (isset($data->items) && is_array($data->items)) {
            $itemStmt = $conn->prepare("INSERT INTO order_items (order_id, cake_id, name, size, qty, price, toppings, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($data->items as $item) {
                $itemStmt->execute([
                    $orderId, 
                    $item->cakeId ?? '', 
                    $item->name ?? '', 
                    $item->size ?? '', 
                    $item->qty ?? 1, 
                    $item->price ?? 0, 
                    json_encode($item->toppings ?? []), 
                    $item->message ?? ''
                ]);
            }
        }

        // Insert History
        $histStmt = $conn->prepare("INSERT INTO order_status_history (order_id, status) VALUES (?, ?)");
        $histStmt->execute([$orderId, 'received']);

        // Update Coupon count if used
        if ($coupon) {
            $conn->query("UPDATE coupons SET used = used + 1 WHERE code = " . $conn->quote($coupon));
        }

        // Update user loyalty points
        if ($userId !== 'guest') {
            $pointsSetting = 10; // Default
            $setStmt = $conn->query("SELECT value_data FROM settings WHERE key_name = 'loyaltyPointsPerDollar'");
            if ($setRow = $setStmt->fetch()) {
                $pointsSetting = (int)json_decode($setRow['value_data']);
            }
            $pointsToAward = floor((float)$total * $pointsSetting);
            
            if ($pointsToAward > 0) {
                $updUserStmt = $conn->prepare("UPDATE users SET loyalty_points = loyalty_points + ? WHERE id = ?");
                $updUserStmt->execute([$pointsToAward, $userId]);
            }
        }

        $conn->commit();

        echo json_encode([
            "success" => true,
            "id" => $orderId,
            "trackingId" => $trackingId
        ]);

    } catch(PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(["error" => "Failed to create order: " . $e->getMessage()]);
    }
}
else if ($method === 'PUT') {
    // Update order status or driver
    $data = json_decode(file_get_contents("php://input"));
    $orderId = $data->id ?? null;

    if (!$orderId) {
        http_response_code(400);
        echo json_encode(["error" => "Order ID is required"]);
        exit;
    }

    try {
        // Update status
        if (isset($data->status)) {
            $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
            $stmt->execute([$data->status, $orderId]);

            // Insert into order_status_history
            $histStmt = $conn->prepare("INSERT INTO order_status_history (order_id, status) VALUES (?, ?)");
            $histStmt->execute([$orderId, $data->status]);
        }

        // Update driver
        if (isset($data->driverId)) {
            $driverId = $data->driverId === '' ? null : $data->driverId;
            $stmt = $conn->prepare("UPDATE orders SET driver_id = ? WHERE id = ?");
            $stmt->execute([$driverId, $orderId]);
        }

        echo json_encode(["success" => true]);

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to update order: " . $e->getMessage()]);
    }
}
?>
