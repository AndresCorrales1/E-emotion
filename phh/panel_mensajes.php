<?php
require __DIR__ . '/admin_auth.php';
require __DIR__ . '/utilidades.php';

$mensaje = '';
$tipoMsg = 'exito';
$tablaOk = true;
$revision = [];
$ocultos = [];

if ($dentro && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion'])) {
    if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
        $mensaje = 'La sesión se venció. Intenta de nuevo.';
        $tipoMsg = 'fallo';
    } else {
        $id = (int) ($_POST['id'] ?? 0);
        try {
            if ($_POST['accion'] === 'publicar') {
                $st = $pdo->prepare("UPDATE mensajes SET estado = 'visible' WHERE id = ? AND estado IN ('revision','oculto')");
                $st->execute([$id]);
                $pdo->prepare('DELETE FROM reportes WHERE mensaje_id = ?')->execute([$id]);
                $mensaje = 'El mensaje se publicó en Blogs.';
            } elseif ($_POST['accion'] === 'eliminar') {
                $st = $pdo->prepare("SELECT id FROM mensajes WHERE id = ? AND estado IN ('revision','oculto')");
                $st->execute([$id]);
                if ($st->fetch()) {
                    $pdo->prepare('DELETE FROM reportes WHERE mensaje_id = ?')->execute([$id]);
                    $pdo->prepare('DELETE FROM mensajes WHERE id = ?')->execute([$id]);
                    $mensaje = 'El mensaje se eliminó.';
                }
            }
        } catch (PDOException $e) {
            $mensaje = 'No se pudo completar la acción.';
            $tipoMsg = 'fallo';
        }
    }
}

if ($dentro) {
    try {
        $filas = $pdo->query(
            "SELECT m.id, m.contenido, m.creado_en, m.estado,
                    (SELECT COUNT(*) FROM reportes r WHERE r.mensaje_id = m.id) AS reportes
             FROM mensajes m
             WHERE m.estado IN ('revision','oculto')
             ORDER BY m.id DESC
             LIMIT 200"
        )->fetchAll();
        foreach ($filas as $f) {
            if ($f['estado'] === 'revision') $revision[] = $f; else $ocultos[] = $f;
        }
    } catch (PDOException $e) {
        $tablaOk = false;
    }
    $frasesActuales = $tablaOk ? cargar_frases_crisis($pdo) : [];
}

function tarjeta_mensaje(array $m, ?string $detalle): void { ?>
  <div class="msg">
    <p><?= h($m['contenido']) ?></p>
    <div class="meta">Escrito el <?= h((string) $m['creado_en']) ?><?= $detalle ? ' · ' . h($detalle) : '' ?></div>
    <div class="botones">
      <form method="post" onsubmit="return confirm('¿Publicar este mensaje en Blogs?');">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="accion" value="publicar">
        <input type="hidden" name="id" value="<?= (int) $m['id'] ?>">
        <button type="submit" class="ok">Publicar</button>
      </form>
      <form method="post" onsubmit="return confirm('¿Eliminar este mensaje? No se puede deshacer.');">
        <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
        <input type="hidden" name="accion" value="eliminar">
        <input type="hidden" name="id" value="<?= (int) $m['id'] ?>">
        <button type="submit" class="quitar">Eliminar</button>
      </form>
    </div>
  </div>
<?php }

admin_inicio('Mensajes por revisar');

if (!$dentro) {
    admin_acceso();
} elseif (!$tablaOk) {
    ?><p class="aviso">No se pudieron leer los mensajes. Verifica que la base de datos tenga las tablas <code>mensajes</code> y <code>reportes</code>.</p><?php
} else {
    ?>
  <h1>Mensajes por revisar</h1>
  <p class="ayuda">
    Aquí aparecen los mensajes de Blogs que <strong>no se han publicado</strong> y esperan tu decisión.
    Puedes <strong>publicarlos</strong> o <strong>eliminarlos</strong>. No se muestra quién los escribió.
  </p>
  <?php if ($mensaje): ?><p class="<?= $tipoMsg ?>"><?= h($mensaje) ?></p><?php endif; ?>

  <h2>Retenidos por frases de alerta (<?= count($revision) ?>)</h2>
  <p class="ayuda">La persona ya vio las líneas de ayuda (Línea Amiga, 106 y 123) al enviarlo.</p>
  <?php if (!$revision): ?>
    <p class="exito">No hay mensajes pendientes en esta lista. 💜</p>
  <?php else: foreach ($revision as $m):
      $f = frase_crisis_detectada($m['contenido'], $frasesActuales);
      tarjeta_mensaje($m, $f !== null ? 'Frase detectada: "' . $f . '"' : null);
  endforeach; endif; ?>

  <h2>Ocultos por reportes (<?= count($ocultos) ?>)</h2>
  <p class="ayuda">Mensajes que otras personas reportaron 3 veces o más y que se ocultaron automáticamente.</p>
  <?php if (!$ocultos): ?>
    <p class="exito">No hay mensajes pendientes en esta lista.</p>
  <?php else: foreach ($ocultos as $m):
      tarjeta_mensaje($m, $m['reportes'] . ' reportes');
  endforeach; endif; ?>
    <?php
}
admin_fin();
