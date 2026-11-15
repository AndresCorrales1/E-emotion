<?php
require __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$d     = json_decode(file_get_contents('php://input'), true) ?: [];
$boton = $d['boton'] ?? '';

if (!in_array($boton, ['whatsapp', 'linea106'], true)) {
    responder(['ok' => false, 'error' => 'Botón no válido.'], 422);
}

// Solo se suma 1 al total. No se guarda IP, cookie, usuario ni ningun dato de la persona.
try {
    $st = $pdo->prepare(
        'INSERT INTO clics_ayuda (boton, total) VALUES (?, 1)
         ON DUPLICATE KEY UPDATE total = total + 1'
    );
    $st->execute([$boton]);
} catch (PDOException $e) {
    responder(['ok' => false, 'error' => 'No se pudo registrar.'], 500);
}

responder(['ok' => true]);
