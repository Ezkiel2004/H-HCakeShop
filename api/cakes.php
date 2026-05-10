<?php
// api/cakes.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM cakes WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $cake = $stmt->fetch();
            
            if ($cake) {
                // Parse JSON fields
                $cake['sizes'] = json_decode($cake['sizes']);
                $cake['toppings'] = json_decode($cake['toppings']);
                // Convert to bool
                $cake['bestseller'] = (bool)$cake['bestseller'];
                $cake['available'] = (bool)$cake['available'];
                $cake['price'] = (float)$cake['price'];
                $cake['rating'] = (float)$cake['rating'];
                
                echo json_encode($cake);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Cake not found"]);
            }
        } else {
            $stmt = $conn->query("SELECT * FROM cakes ORDER BY created_at ASC");
            $cakes = [];
            while ($row = $stmt->fetch()) {
                // Parse JSON fields
                $row['sizes'] = json_decode($row['sizes']);
                $row['toppings'] = json_decode($row['toppings']);
                // Convert types
                $row['bestseller'] = (bool)$row['bestseller'];
                $row['available'] = (bool)$row['available'];
                $row['price'] = (float)$row['price'];
                $row['rating'] = (float)$row['rating'];
                $cakes[] = $row;
            }
            echo json_encode($cakes);
        }
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
