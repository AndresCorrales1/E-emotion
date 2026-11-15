<?php
require __DIR__ . '/admin_auth.php';

$totales = ['whatsapp' => 0, 'linea106' => 0];
$falloBD = false;

if ($dentro) {
    try {
        foreach ($pdo->query('SELECT boton, total FROM clics_ayuda') as $f) {
            $totales[$f['boton']] = (int) $f['total'];
        }
    } catch (PDOException $e) {
        $falloBD = true;
    }
}

admin_inicio('Botones de ayuda');

if (!$dentro) {
    admin_acceso();
} elseif ($falloBD) {
    ?><p class="aviso">No se pudo leer la información. Verifica que ya ejecutaste el archivo <code>clics_ayuda.sql</code> en la base de datos.</p><?php
} else {
    ?>
  <h1>Botones de ayuda: personas que los tocaron</h1>
  <div class="tarjetas">
    <div class="tarjeta wa"><div class="numero"><?= number_format($totales['whatsapp'], 0, ',', '.') ?></div><div class="nombre">Botón WhatsApp</div></div>
    <div class="tarjeta tel"><div class="numero"><?= number_format($totales['linea106'], 0, ',', '.') ?></div><div class="nombre">Botón Llamar al 106</div></div>
  </div>
  <p><small>Cada persona se cuenta una sola vez por botón (según su navegador). No se guarda quién fue. Recarga la página para ver los números al día.</small></p>
    <?php
}
admin_fin();
