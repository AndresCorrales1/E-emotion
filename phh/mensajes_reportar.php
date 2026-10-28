<?php
require __DIR__ . '/conexion.php';
require __DIR__ . '/utilidades.php';

exigir_post_json();

$usuario = usuario_actual($pdo);
if (!$usuario) {
    responder(['ok' => false, 'error' => 'No registrado.'], 401);
}

$d   = entrada_json();
$mid = (int) ($d['mensaje_id'] ?? 0);

$st = $pdo->prepare("SELECT id FROM mensajes WHERE id = ? AND estado = 'visible'");
$st->execute([$mid]);
if (!$st->fetch()) {
    responder(['ok' => false, 'error' => 'Mensaje no encontrado.'], 404);
}

try {
    $st = $pdo->prepare('INSERT INTO reportes (mensaje_id, usuario_id) VALUES (?, ?)');
    $st->execute([$mid, $usuario['id']]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        responder(['ok' => true, 'aviso' => 'Ya habías reportado este mensaje.']);
    }
    responder(['ok' => false, 'error' => 'No se pudo enviar el reporte.'], 500);
}

// Con 3 reportes de personas distintas, el mensaje se oculta hasta que lo revise un moderador
$st = $pdo->prepare('SELECT COUNT(*) FROM reportes WHERE mensaje_id = ?');
$st->execute([$mid]);
if ($st->fetchColumn() >= 3) {
    $pdo->prepare("UPDATE mensajes SET estado = 'oculto' WHERE id = ?")->execute([$mid]);
}

responder(['ok' => true]);
