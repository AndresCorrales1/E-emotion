<?php
require __DIR__ . '/conexion.php';

$juegos = ['memoria', 'rompecabezas', 'diana', 'escape'];
$juego  = $_GET['juego'] ?? '';

if (!in_array($juego, $juegos, true)) {
    responder(['ok' => false, 'error' => 'Juego no válido.'], 422);
}

$st = $pdo->prepare(
    'SELECT u.nombre_usuario AS nombre, p.puntaje, p.tiempo_segundos AS tiempo
     FROM puntajes p
     JOIN usuarios u ON u.id = p.usuario_id
     WHERE p.juego = ?
     ORDER BY p.puntaje DESC, p.tiempo_segundos ASC
     LIMIT 5'
);
$st->execute([$juego]);

header('Cache-Control: no-store');
responder(['ok' => true, 'ranking' => $st->fetchAll()]);
