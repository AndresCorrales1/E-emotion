<?php
require __DIR__ . '/conexion.php';
require __DIR__ . '/utilidades.php';

exigir_post_json();

$usuario = usuario_actual($pdo);
if (!$usuario) {
    responder(['ok' => false, 'error' => 'No registrado.'], 401);
}

$d     = entrada_json();
$texto = preg_replace('/\s+/u', ' ', trim((string) ($d['contenido'] ?? '')));
$largo = mb_strlen($texto);

if ($largo < 3 || $largo > 200) {
    responder(['ok' => false, 'error' => 'Escribe entre 3 y 200 caracteres.'], 422);
}
if (contiene_datos_personales($texto)) {
    responder(['ok' => false, 'error' => 'Por tu seguridad, no incluyas enlaces, correos ni números de teléfono.'], 422);
}

//1 mensaje cada 30 segundos y 20 por día
$st = $pdo->prepare('SELECT COUNT(*) FROM mensajes WHERE usuario_id = ? AND creado_en > (NOW() - INTERVAL 30 SECOND)');
$st->execute([$usuario['id']]);
if ($st->fetchColumn() > 0) {
    responder(['ok' => false, 'error' => 'Espera unos segundos antes de soltar otro pensamiento.'], 429);
}
$st = $pdo->prepare('SELECT COUNT(*) FROM mensajes WHERE usuario_id = ? AND creado_en > (NOW() - INTERVAL 1 DAY)');
$st->execute([$usuario['id']]);
if ($st->fetchColumn() >= 20) {
    responder(['ok' => false, 'error' => 'Llegaste al límite de hoy. Vuelve mañana 💜'], 429);
}

$crisis = detectar_crisis($texto);
$estado = $crisis ? 'revision' : 'visible';

try {
    $st = $pdo->prepare('INSERT INTO mensajes (usuario_id, contenido, estado) VALUES (?, ?, ?)');
    $st->execute([$usuario['id'], $texto, $estado]);
    $id = (int) $pdo->lastInsertId();
} catch (PDOException $e) {
    responder(['ok' => false, 'error' => 'No se pudo guardar tu pensamiento.'], 500);
}

$respuesta = ['ok' => true, 'id' => $id, 'estado' => $estado, 'contenido' => $texto];
if ($crisis) {
    $respuesta['ayuda'] = ayuda_crisis();
}
responder($respuesta, 201);
