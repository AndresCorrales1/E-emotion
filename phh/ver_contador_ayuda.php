<?php
require __DIR__ . '/conexion.php';

// Devuelve solo los totales (sin ningún dato de personas).
$totales = ['whatsapp' => 0, 'linea106' => 0];
try {
    foreach ($pdo->query('SELECT boton, total FROM clics_ayuda') as $f) {
        $totales[$f['boton']] = (int) $f['total'];
    }
} catch (PDOException $e) {
    responder(['ok' => false], 500);
}

header('Cache-Control: no-store');
responder(['ok' => true] + $totales);
