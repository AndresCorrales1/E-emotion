<?php
require __DIR__ . '/conexion.php';
$u = usuario_actual($pdo);
responder(['ok' => true, 'usuario' => $u ? $u['nombre_usuario'] : null]);
