<?php
require __DIR__ . '/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$usuario = usuario_actual($pdo);
if (!$usuario) {
    responder(['ok' => false, 'error' => 'No registrado.'], 401);
}

try {
    $pdo->beginTransaction();
    $uid = $usuario['id'];

    // Primero lo que depende del ID (reportes -> mensajes -> puntajes) y al final el ID
    $pdo->prepare('DELETE FROM reportes WHERE usuario_id = ? OR mensaje_id IN (SELECT id FROM (SELECT id FROM mensajes WHERE usuario_id = ?) AS m)')->execute([$uid, $uid]);
    $pdo->prepare('DELETE FROM mensajes WHERE usuario_id = ?')->execute([$uid]);
    $pdo->prepare('DELETE FROM puntajes WHERE usuario_id = ?')->execute([$uid]);
    $pdo->prepare('DELETE FROM usuarios WHERE id = ?')->execute([$uid]);

    $pdo->commit();
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    responder(['ok' => false, 'error' => 'No se pudo borrar el ID.'], 500);
}

// Se cierra la sesión de este dispositivo
setcookie('emo_token', '', ['expires' => time() - 3600, 'path' => '/']);
responder(['ok' => true]);
