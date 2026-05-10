<?php
// api/settings.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM settings");
        $settings = [];
        while ($row = $stmt->fetch()) {
            // value_data in DB is stored as stringified JSON to preserve types
            $settings[$row['key_name']] = json_decode($row['value_data']);
        }
        
        // Fallback default settings if DB is empty
        if (empty($settings)) {
            $settings = [
                "platformName" => "CakeCraft",
                "loyaltyPointsPerDollar" => 10,
                "loyaltyPointsRedemption" => 100,
                "currency" => "USD",
                "deliveryFee" => 5.99,
                "freeDeliveryMin" => 50,
                "taxRate" => 0.08
            ];
        }
        
        echo json_encode($settings);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    try {
        $stmt = $conn->prepare("INSERT INTO settings (key_name, value_data) VALUES (?, ?) ON DUPLICATE KEY UPDATE value_data = VALUES(value_data)");
        
        foreach ($data as $key => $value) {
            $stmt->execute([$key, json_encode($value)]);
        }
        
        echo json_encode(["success" => true]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
