<?php
require __DIR__ . '/admin_auth.php';
require __DIR__ . '/utilidades.php';

$mensaje = '';
$tipoMsg = 'exito';
$tablaOk = true;
$frases = [];
$textoPrueba = '';
$resultadoPrueba = null;
$hizoPrueba = false;

/** Dice si una frase ya existe (sin importar tildes, mayúsculas o letras repetidas). */
function frase_repetida(string $nueva, array $existentes): bool {
    $n = normalizar_texto($nueva);
    foreach ($existentes as $f) {
        if (normalizar_texto($f['frase']) === $n) return true;
    }
    return false;
}

if ($dentro) {
    try {
        $frases = $pdo->query('SELECT id, frase FROM filtros_crisis ORDER BY frase')->fetchAll();
    } catch (PDOException $e) {
        $tablaOk = false;
    }

    if ($tablaOk && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['accion'])) {
        if (!hash_equals($_SESSION['csrf'] ?? '', (string) ($_POST['csrf'] ?? ''))) {
            $mensaje = 'La sesión se venció. Intenta de nuevo.';
            $tipoMsg = 'fallo';
        } else {
            $accion = $_POST['accion'];

            if ($accion === 'agregar') {
                $agregadas = 0; $omitidas = 0;
                $lineas = preg_split('/[\r\n]+/', (string) ($_POST['frases'] ?? ''));
                foreach ($lineas as $linea) {
                    $linea = trim(preg_replace('/\s+/u', ' ', $linea));
                    if ($linea === '') continue;
                    $largoNorm = mb_strlen(normalizar_texto($linea));
                    if ($largoNorm < 4 || mb_strlen($linea) > 100 || frase_repetida($linea, $frases)) {
                        $omitidas++;
                        continue;
                    }
                    $pdo->prepare('INSERT INTO filtros_crisis (frase) VALUES (?)')->execute([$linea]);
                    $frases[] = ['id' => 0, 'frase' => $linea];
                    $agregadas++;
                }
                if ($agregadas > 0) {
                    $mensaje = $agregadas === 1 ? 'Se agregó 1 frase.' : "Se agregaron $agregadas frases.";
                    if ($omitidas > 0) $mensaje .= " ($omitidas no se agregaron: ya existían o eran muy cortas.)";
                } else {
                    $mensaje = 'No se agregó nada. Revisa que la frase tenga al menos 4 letras y que no esté ya en la lista.';
                    $tipoMsg = 'fallo';
                }
            } elseif ($accion === 'quitar') {
                $pdo->prepare('DELETE FROM filtros_crisis WHERE id = ?')->execute([(int) ($_POST['id'] ?? 0)]);
                $mensaje = 'Frase quitada.';
            } elseif ($accion === 'probar') {
                $hizoPrueba = true;
                $textoPrueba = mb_substr((string) ($_POST['texto'] ?? ''), 0, 300);
            }

            // Se vuelve a leer la lista con los cambios
            $frases = $pdo->query('SELECT id, frase FROM filtros_crisis ORDER BY frase')->fetchAll();
            if ($hizoPrueba) {
                $resultadoPrueba = frase_crisis_detectada($textoPrueba, array_column($frases, 'frase'));
            }
        }
    }
}

admin_inicio('Frases de alerta');

if (!$dentro) {
    admin_acceso();
} elseif (!$tablaOk) {
    ?><p class="aviso">Falta un paso técnico: hay que ejecutar el archivo <code>filtros_crisis.sql</code> en la base de datos. Pídele a quien instaló el sitio que lo haga.</p><?php
} else {
    ?>
  <h1>Frases de alerta de "Blogs"</h1>
  <p class="ayuda">
    Cuando alguien escribe un pensamiento en Blogs y contiene alguna de estas frases, el mensaje
    <strong>no se publica</strong> y a la persona se le muestran las líneas de ayuda (Línea Amiga, 106 y 123).
    Los cambios que hagas aquí funcionan <strong>de inmediato</strong>.
  </p>

  <?php if ($mensaje): ?><p class="<?= $tipoMsg ?>"><?= h($mensaje) ?></p><?php endif; ?>

  <h2>Agregar frases</h2>
  <p class="ayuda">
    Escribe <strong>una frase por línea</strong>. No importa si lleva mayúsculas o tildes. La frase se busca
    <em>dentro</em> del mensaje, así que una parte de la palabra basta: por ejemplo "suicid" detecta
    "suicidio", "suicidarme", etc. El filtro también reconoce faltas de ortografía comunes
    (por ejemplo "bida" por "vida", "kiero" por "quiero", letras repetidas, espacios de más o números en lugar de letras),
    y en frases largas tolera una letra mal escrita. En frases cortas (menos de 10 letras) conviene agregar tú misma
    las variantes que se te ocurran. Usa frases con al menos 4 letras para no frenar mensajes que no son de riesgo.
  </p>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
    <input type="hidden" name="accion" value="agregar">
    <textarea name="frases" rows="4" placeholder="Ejemplo:&#10;ya no aguanto más&#10;quiero desaparecer"></textarea>
    <button type="submit">Agregar</button>
  </form>

  <h2>Probar un mensaje</h2>
  <p class="ayuda">Escribe un mensaje de ejemplo para ver si el sitio lo marcaría como alerta. No se guarda ni se publica.</p>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
    <input type="hidden" name="accion" value="probar">
    <input type="text" name="texto" maxlength="300" value="<?= h($textoPrueba) ?>" placeholder="Escribe un mensaje de prueba">
    <button type="submit" class="sec">Probar</button>
  </form>
  <?php if ($hizoPrueba): ?>
    <?php if ($resultadoPrueba !== null): ?>
      <p class="exito">⚠️ <strong>Sí saltaría la alerta</strong>, por la frase: "<?= h($resultadoPrueba) ?>".</p>
    <?php else: ?>
      <p class="aviso">No saltaría ninguna alerta: ese mensaje se publicaría normalmente.</p>
    <?php endif; ?>
  <?php endif; ?>

  <h2>Frases actuales (<?= count($frases) ?>)</h2>
  <?php if (!$frases): ?>
    <p class="aviso">No hay ninguna frase: ahora mismo el sitio no marca ningún mensaje como alerta.</p>
  <?php else: ?>
    <ul class="frases">
      <?php foreach ($frases as $f): ?>
        <li>
          <span><?= h($f['frase']) ?></span>
          <form method="post" onsubmit="return confirm('¿Quitar esta frase?');">
            <input type="hidden" name="csrf" value="<?= h($_SESSION['csrf']) ?>">
            <input type="hidden" name="accion" value="quitar">
            <input type="hidden" name="id" value="<?= (int) $f['id'] ?>">
            <button type="submit" class="quitar">Quitar</button>
          </form>
        </li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>
    <?php
}
admin_fin();
