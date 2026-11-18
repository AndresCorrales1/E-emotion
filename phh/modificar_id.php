<?php
require __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    responder(['ok' => false, 'error' => 'Petición no válida.'], 400);
}

$usuario = usuario_actual($pdo);
if (!$usuario) {
    responder(['ok' => false, 'error' => 'No registrado.'], 401);
}

$d      = json_decode(file_get_contents('php://input'), true) ?: [];
$nombre = trim($d['nombre_usuario'] ?? '');

// Mismas reglas que al registrarse
if (!preg_match('/^[\p{L}\p{N}_.#\- ]{3,30}$/u', $nombre)) {
    responder(['ok' => false, 'error' => 'El ID debe tener 3 a 30 caracteres (letras, números, espacios, # _ . -).'], 422);
}

try {
    $st = $pdo->prepare('UPDATE usuarios SET nombre_usuario = ? WHERE id = ?');
    $st->execute([$nombre, $usuario['id']]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder(['ok' => false, 'error' => 'Ese ID ya está en uso, prueba con otro.'], 409);
    }
    responder(['ok' => false, 'error' => 'No se pudo cambiar el ID.'], 500);
}

responder(['ok' => true, 'usuario' => $nombre]);
