<?php
// api/coupons.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $code = isset($_GET['code']) ? strtoupper($_GET['code']) : null;
    
    try {
        if ($code) {
            $stmt = $conn->prepare("SELECT * FROM coupons WHERE code = ? AND active = 1 AND expires_at > NOW()");
            $stmt->execute([$code]);
            $coupon = $stmt->fetch();
            
            if ($coupon) {
                // Check uses
                if ($coupon['max_uses'] !== null && $coupon['used'] >= $coupon['max_uses']) {
                     http_response_code(400);
                     echo json_encode(["error" => "Coupon limit reached"]);
                     exit;
                }
                
                echo json_encode([
                    "id" => $coupon['id'],
                    "code" => $coupon['code'],
                    "type" => $coupon['type'],
                    "value" => (float)$coupon['value'],
                    "minOrder" => (float)$coupon['min_order']
                ]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Invalid or expired coupon"]);
            }
        } else {
            // Admin mostly: fetch all
            $stmt = $conn->query("SELECT * FROM coupons");
            $coupons = [];
            while ($row = $stmt->fetch()) {
                $row['value'] = (float)$row['value'];
                $row['minOrder'] = (float)$row['min_order'];
                $row['active'] = (bool)$row['active'];
                $coupons[] = $row;
            }
            echo json_encode($coupons);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else if ($method === 'POST') {
    // Create a new coupon
    $data = json_decode(file_get_contents("php://input"));
    
    try {
        $id = $data->id ?? ('coup_' . substr(md5(uniqid()), 0, 8));
        $code = strtoupper($data->code ?? '');
        $type = $data->type ?? 'percentage';
        $value = $data->value ?? 0;
        $minOrder = $data->minOrder ?? 0;
        $maxUses = $data->maxUses ?? 100;
        $expiresAt = $data->expiresAt ?? '2026-12-31 23:59:59';

        $stmt = $conn->prepare("INSERT INTO coupons (id, code, type, value, min_order, max_uses, used, active, expires_at) VALUES (?, ?, ?, ?, ?, ?, 0, 1, ?)");
        $stmt->execute([$id, $code, $type, $value, $minOrder, $maxUses, $expiresAt]);

        echo json_encode([
            "success" => true,
            "id" => $id,
            "code" => $code,
            "type" => $type,
            "value" => (float)$value,
            "minOrder" => (float)$minOrder,
            "maxUses" => (int)$maxUses,
            "used" => 0,
            "active" => true
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to create coupon: " . $e->getMessage()]);
    }
} else if ($method === 'DELETE') {
    // Delete a coupon
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(["error" => "Coupon ID is required"]);
        exit;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM coupons WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to delete coupon: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
