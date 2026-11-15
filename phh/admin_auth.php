<?php
// Acceso con clave compartido por las páginas de administracion
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/config_admin.php';

session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'secure' => !empty($_SERVER['HTTPS'])]);
session_start();
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

function h(string $s): string { return htmlspecialchars($s, ENT_QUOTES, 'UTF-8'); }

$claveSinCambiar = (CLAVE_ESTADISTICAS === 'cambiar-esta-clave' || strlen(CLAVE_ESTADISTICAS) < 8);
$errorAcceso = '';
$aqui = basename($_SERVER['SCRIPT_NAME']);

if (isset($_POST['salir'])) {
    $_SESSION = [];
    session_destroy();
    header('Location: ' . $aqui);
    exit;
}

if (isset($_POST['clave']) && !$claveSinCambiar) {
    if (hash_equals(CLAVE_ESTADISTICAS, (string) $_POST['clave'])) {
        session_regenerate_id(true);
        $_SESSION['ok_estadisticas'] = true;
        header('Location: ' . $aqui);
        exit;
    }
    sleep(1); // frena intentos repetidos
    $errorAcceso = 'Clave incorrecta.';
}

$dentro = !empty($_SESSION['ok_estadisticas']) && !$claveSinCambiar;
if ($dentro && empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
}

function admin_inicio(string $titulo): void {
    global $dentro, $aqui, $pdo;
    $pendientes = 0;
    if ($dentro) {
        try {
            $pendientes = (int) $pdo->query("SELECT COUNT(*) FROM mensajes WHERE estado IN ('revision','oculto')")->fetchColumn();
        } catch (PDOException $e) { /* sin tabla: no se muestra el número */ }
    }
    ?><!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title><?= h($titulo) ?> · E-emotion</title>
<link rel="stylesheet" href="../CSS/admin.css">
</head>
<body>
<div class="caja">
<?php if ($dentro): ?>
<nav>
  <a href="panel_mensajes.php" class="<?= $aqui === 'panel_mensajes.php' ? 'actual' : '' ?>">Mensajes por revisar<?= $pendientes > 0 ? ' (' . $pendientes . ')' : '' ?></a>
  <a href="panel_filtros.php" class="<?= $aqui === 'panel_filtros.php' ? 'actual' : '' ?>">Frases de alerta</a>
  <a href="estadisticas_ayuda.php" class="<?= $aqui === 'estadisticas_ayuda.php' ? 'actual' : '' ?>">Botones de ayuda</a>
  <form method="post"><button class="sec" name="salir" value="1">Salir</button></form>
</nav>
<?php endif;
}

function admin_acceso(): void {
    global $claveSinCambiar, $errorAcceso;
    if ($claveSinCambiar): ?>
  <p class="aviso"><strong>Falta un paso:</strong> abre el archivo <code>phh/config_admin.php</code>, cambia
  <code>cambiar-esta-clave</code> por una clave tuya de al menos 8 caracteres y guarda. Luego recarga esta página.</p>
<?php else: ?>
  <h1>Acceso</h1>
  <form method="post">
    <label for="clave">Clave de acceso</label>
    <input type="password" id="clave" name="clave" autofocus required>
    <?php if ($errorAcceso): ?><p class="error"><?= h($errorAcceso) ?></p><?php endif; ?>
    <button type="submit">Entrar</button>
  </form>
<?php endif;
}

function admin_fin(): void {
    echo "</div>\n</body>\n</html>";
}
