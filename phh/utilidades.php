<?php
// Funciones compartidas por los PHP de mensajes

function exigir_post_json(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(['ok' => false, 'error' => 'Método no permitido.'], 405);
    }
    // Solo JSON
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
        responder(['ok' => false, 'error' => 'Petición no válida.'], 400);
    }
}

function entrada_json(): array {
    $d = json_decode(file_get_contents('php://input'), true);
    return is_array($d) ? $d : [];
}

/** Frases con las que viene el sitio. Se usan si la tabla filtros_crisis aún no existe. */
function frases_crisis_iniciales(): array {
    return [
        'suicid', 'quitarme la vida', 'quitarnos la vida', 'quiero morir', 'quiero morirme',
        'no quiero vivir', 'ya no quiero estar aquí', 'acabar con todo', 'acabar con mi vida',
        'terminar con mi vida', 'hacerme daño', 'lastimarme', 'matarme',
        'cortarme', 'autolesi', 'mejor muerto', 'mejor muerta', 'no vale la pena vivir',
    ];
}

/**
 * Deja el texto "parejo" para comparar, de modo que las faltas de ortografía no engañen al filtro:
 * minúsculas, sin tildes, sin signos, letras repetidas juntas ("morirrr" = "morir"),
 * letras que suenan igual unificadas (b/v, c/s/z/k/q, ll/y, g/j, h muda)
 * y números usados como letras ("m4tarme" = "matarme").
 */
function normalizar_texto(string $t): string {
    $t = mb_strtolower($t, 'UTF-8');
    $t = strtr($t, [
        'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a',
        'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
        'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
        'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o',
        'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
        'ñ' => 'n',
        '@' => 'a', '0' => 'o', '1' => 'i', '3' => 'e', '4' => 'a', '5' => 's', '7' => 't',
    ]);
    $t = str_replace('qu', 'k', $t);
    $t = preg_replace('/c(?=[ei])/u', 's', $t);
    $t = str_replace(['c', 'z', 'v', 'h', 'll'], ['k', 's', 'b', '', 'y'], $t);
    $t = preg_replace('/g(?=[ei])/u', 'j', $t);
    $t = preg_replace('/[^\p{L}\p{N}]+/u', ' ', $t);
    $t = preg_replace('/(\p{L})\1+/u', '$1', $t);
    return trim($t);
}

/** Menor número de errores (letras de más, de menos o cambiadas) para encontrar $patron dentro de $texto. */
function distancia_aproximada(array $patron, array $texto): int {
    $m = count($patron);
    $n = count($texto);
    if ($m === 0) return 0;
    $prev = array_fill(0, $n + 1, 0);
    for ($i = 1; $i <= $m; $i++) {
        $cur = [$i];
        for ($j = 1; $j <= $n; $j++) {
            $costo = ($patron[$i - 1] === $texto[$j - 1]) ? 0 : 1;
            $cur[$j] = min($prev[$j - 1] + $costo, $prev[$j] + 1, $cur[$j - 1] + 1);
        }
        $prev = $cur;
    }
    return min($prev);
}

/** Frases de alerta guardadas (las que edita la psicóloga desde el panel). */
function cargar_frases_crisis(?PDO $pdo): array {
    if ($pdo) {
        try {
            return $pdo->query('SELECT frase FROM filtros_crisis')->fetchAll(PDO::FETCH_COLUMN);
        } catch (PDOException $e) {
            // La tabla aún no existe: se usan las frases iniciales
        }
    }
    return frases_crisis_iniciales();
}

/**
 * Devuelve la frase de alerta encontrada en el texto, o null si no hay ninguna.
 * Detecta la frase aunque tenga faltas de ortografía, espacios de más o de menos,
 * o una letra mal escrita (en frases de 10 letras o más).
 */
function frase_crisis_detectada(string $texto, array $frases): ?string {
    $t  = normalizar_texto($texto);
    $tc = str_replace(' ', '', $t);   // sin espacios: "acabarconmivida" o "q u i e r o"
    $tcLetras = null;

    foreach ($frases as $f) {
        $n = normalizar_texto((string) $f);
        if ($n === '') continue;

        if (str_contains($t, $n)) return (string) $f;

        $nc = str_replace(' ', '', $n);
        $largo = mb_strlen($nc);
        if ($largo >= 6 && str_contains($tc, $nc)) return (string) $f;

        // Errores permitidos según el largo: frases cortas exactas, largas con 1 o 2 letras de margen
        $margen = $largo < 10 ? 0 : ($largo < 16 ? 1 : 2);
        if ($margen > 0) {
            $tcLetras ??= mb_str_split($tc);
            if (distancia_aproximada(mb_str_split($nc), $tcLetras) <= $margen) return (string) $f;
        }
    }
    return null;
}

/**El mensaje NO se publica hasta que lo revise una persona. */
function detectar_crisis(string $texto, ?PDO $pdo = null): bool {
    return frase_crisis_detectada($texto, cargar_frases_crisis($pdo)) !== null;
}

/** enlaces, correos o numeros de telefono no se permiten*/
function contiene_datos_personales(string $t): bool {
    return (bool) preg_match('/(https?:\/\/|www\.)|\S+@\S+\.\S+|(?:\d[\s.\-]*){7,}/iu', $t);
}

function ayuda_crisis(): array {
    return [
        'mensaje' => 'Gracias por soltarlo. Lo que sientes importa y no tienes que pasarlo solo/a. '
                   . 'Si estás en peligro o piensas en hacerte daño, habla ahora con alguien:',
        'lineas' => [
            ['nombre' => 'Línea Amiga (Medellín)', 'texto' => '(604) 444 44 48', 'tel' => '+576044444448'],
            ['nombre' => 'Línea 106',              'texto' => '106',              'tel' => '106'],
            ['nombre' => 'Emergencias',            'texto' => '123',              'tel' => '123'],
        ],
    ];
}
