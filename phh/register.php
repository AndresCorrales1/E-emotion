<?php
require __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}
// solo acepta JSON)
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    responder(['ok' => false, 'error' => 'Petición no válida.'], 400);
}

$d      = json_decode(file_get_contents('php://input'), true) ?: [];
$nombre = trim($d['nombre_usuario'] ?? '');
$anio   = (int) ($d['anio'] ?? 0);
$mes    = (int) ($d['mes'] ?? 0);
$dia    = (int) ($d['dia'] ?? 0);

if (!preg_match('/^[\p{L}\p{N}_.#\- ]{3,30}$/u', $nombre)) {
    responder(['ok' => false, 'error' => 'El ID debe tener 3 a 30 caracteres (letras, números, espacios, # _ . -).'], 422);
}
if ($anio < 1900 || $anio > 2099 || !checkdate($mes, $dia, $anio)) {
    responder(['ok' => false, 'error' => 'La fecha no es válida.'], 422);
}

$token = bin2hex(random_bytes(32));
$fecha = sprintf('%04d-%02d-%02d', $anio, $mes, $dia);

try {
    $st = $pdo->prepare('INSERT INTO usuarios (nombre_usuario, token_hash, fecha_registro) VALUES (?, ?, ?)');
    $st->execute([$nombre, hash('sha256', $token), $fecha]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder(['ok' => false, 'error' => 'Ese ID ya está en uso, prueba con otro.'], 409);
    }
    responder(['ok' => false, 'error' => 'No se pudo completar el registro.'], 500);
}

setcookie('emo_token', $token, [
    'expires'  => time() + 60 * 60 * 24 * 365,
    'path'     => '/',
    'httponly' => true,
    'samesite' => 'Lax',
    'secure'   => !empty($_SERVER['HTTPS']),
]);

responder(['ok' => true, 'usuario' => $nombre, 'fecha' => $fecha], 201);
