<?php
$host = 'localhost';
$db   = 'emotion_db';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    exit(json_encode(['ok' => false, 'error' => 'Error de conexión a la base de datos.']));
}

/** Devuelve id nombre usuario si la cookie es valida o null*/
function usuario_actual(PDO $pdo): ?array {
    $t = $_COOKIE['emo_token'] ?? '';
    if (!preg_match('/^[a-f0-9]{64}$/', $t)) {
        return null;
    }
    $st = $pdo->prepare('SELECT id, nombre_usuario FROM usuarios WHERE token_hash = ?');
    $st->execute([hash('sha256', $t)]);
    return $st->fetch() ?: null;
}

function responder(array $datos, int $codigo = 200): void {
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}
