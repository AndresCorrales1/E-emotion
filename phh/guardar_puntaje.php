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

// Puntaje máximo razonable por juego (descarta valores imposibles)
$maximos = ['memoria' => 20000, 'rompecabezas' => 5000, 'diana' => 20000, 'escape' => 10000];

$d      = json_decode(file_get_contents('php://input'), true) ?: [];
$juego  = $d['juego'] ?? '';
$puntaje = (int) ($d['puntaje'] ?? -1);
$tiempo  = (int) ($d['tiempo'] ?? -1);

if (!isset($maximos[$juego])) {
    responder(['ok' => false, 'error' => 'Juego no válido.'], 422);
}
if ($puntaje < 0 || $puntaje > $maximos[$juego] || $tiempo < 0 || $tiempo > 7200) {
    responder(['ok' => false, 'error' => 'Datos fuera de rango.'], 422);
}

try {
    // Guarda solo el mejor puntaje de cada persona en cada juego
    $st = $pdo->prepare(
        'INSERT INTO puntajes (usuario_id, juego, puntaje, tiempo_segundos) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           tiempo_segundos = IF(VALUES(puntaje) > puntaje, VALUES(tiempo_segundos), tiempo_segundos),
           puntaje = GREATEST(puntaje, VALUES(puntaje))'
    );
    $st->execute([$usuario['id'], $juego, $puntaje, $tiempo]);

    $st = $pdo->prepare('SELECT puntaje FROM puntajes WHERE usuario_id = ? AND juego = ?');
    $st->execute([$usuario['id'], $juego]);
    $mejor = (int) $st->fetchColumn();
} catch (PDOException $e) {
    responder(['ok' => false, 'error' => 'No se pudo guardar el puntaje.'], 500);
}

responder(['ok' => true, 'mejor' => $mejor]);
