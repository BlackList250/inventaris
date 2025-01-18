<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

$host = 'localhost';
$user = 'root';
$password = '';
$database = 'inventaris';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Gagal terhubung dengan database: " . $conn->connect_error);
}

$method = $_SERVER['REQUEST_METHOD'];
$table = 'gudang_1';

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("SELECT * FROM $table WHERE id_barang = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();
            echo json_encode($result);
        } else {
            $result = $conn->query("SELECT * FROM $table");
            echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        }
        break;
    
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $conn->prepare("INSERT INTO $table (nama, stok) VALUES (?, ?)");
        $stmt->bind_param("si", $data['nama'], $data['stok']);
        $stmt->execute();
        echo json_encode(["id" => $conn->insert_id]);
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'];

        $stmt = $conn->prepare("UPDATE $table SET nama = ?, stok = ? WHERE id_barang = ?");
        $stmt->bind_param("sii", $data['nama'], $data['stok'], $data['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $barang = $result->fetch_assoc();
        echo json_encode(["updated" => true]);
        
        break;

    case 'DELETE':
        if (isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $stmt = $conn->prepare("DELETE FROM $table WHERE id_barang = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            
            if ($stmt->affected_rows > 0) {
                echo json_encode(["deleted" => true]);
            } else {
                echo json_encode(["error" => "Data tidak ditemukan"]);
            }
        }
        break;

    default:
        echo json_encode(["error" => "Metode tidak didukung"]);
        break;
}

$conn->close();
?>
