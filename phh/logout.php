<?php
require __DIR__ . '/conexion.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
}
setcookie('emo_token', '', ['expires' => time() - 3600, 'path' => '/']);
responder(['ok' => true]);
