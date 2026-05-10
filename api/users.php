<?php
// api/users.php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    // Read JSON payload for Login or Register
    $data = json_decode(file_get_contents("php://input"));
    $action = $_GET['action'] ?? '';

    if ($action === 'login') {
        if (!isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["error" => "Email and password required"]);
            return;
        }
        
        $stmt = $conn->prepare("SELECT * FROM users WHERE email = ? AND password = ?");
        // In a real app we'd use password_verify, but matching mock data plaintext for simplicity here
        $stmt->execute([$data->email, $data->password]);
        $user = $stmt->fetch();
        
        if ($user) {
            unset($user['password']); // Don't return password
            $user['loyaltyPoints'] = (int)$user['loyalty_points'];
            echo json_encode($user);
        } else {
            http_response_code(401);
            echo json_encode(["error" => "Invalid credentials"]);
        }
    } 
    else if ($action === 'register') {
        if (!isset($data->name) || !isset($data->email) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(["error" => "Name, email, and password required"]);
            return;
        }

        $id = 'user_' . substr(md5(uniqid()), 0, 8);
        $role = $data->role ?? 'customer';
        $phone = $data->phone ?? null;
        $vehicle = $data->vehicle ?? null;
        
        try {
            $stmt = $conn->prepare("INSERT INTO users (id, name, email, password, role, phone, vehicle) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id, $data->name, $data->email, $data->password, $role, $phone, $vehicle]);
            
            // Return created user
            echo json_encode([
                "id" => $id,
                "name" => $data->name,
                "email" => $data->email,
                "role" => $role,
                "phone" => $phone,
                "vehicle" => $vehicle,
                "loyaltyPoints" => 0,
                "status" => "active"
            ]);
        } catch(PDOException $e) {
            http_response_code(409); // Conflict, likely duplicate email
            echo json_encode(["error" => "Email already exists"]);
        }
    }
} else if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $conn->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $user = $stmt->fetch();
        if ($user) {
            unset($user['password']);
            $user['loyaltyPoints'] = (int)$user['loyalty_points'];
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "User not found"]);
        }
    } else {
        $stmt = $conn->query("SELECT * FROM users");
        $users = [];
        while ($row = $stmt->fetch()) {
            unset($row['password']);
            $row['loyaltyPoints'] = (int)$row['loyalty_points'];
            $users[] = $row;
        }
        echo json_encode($users);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>
