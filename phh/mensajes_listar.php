<?php
require __DIR__ . '/conexion.php';

$antes = (int) ($_GET['antes'] ?? 0);
if ($antes <= 0) $antes = 2147483647;
$limite = 12;

$st = $pdo->prepare(
    "SELECT id, contenido, creado_en
     FROM mensajes
     WHERE estado = 'visible' AND id < :antes
     ORDER BY id DESC
     LIMIT :lim"
);
$st->bindValue(':antes', $antes, PDO::PARAM_INT);
$st->bindValue(':lim', $limite, PDO::PARAM_INT);
$st->execute();
$mensajes = $st->fetchAll();

header('Cache-Control: no-store');
responder([
    'ok'        => true,
    'mensajes'  => $mensajes,
    'siguiente' => count($mensajes) === $limite ? (int) end($mensajes)['id'] : null,
]);
