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

/**El mensaje NO se publica hasta que lo revise una persona. */
function detectar_crisis(string $texto): bool {
    $t = mb_strtolower($texto);
    $claves = [
        'suicid', 'quitarme la vida', 'quitarnos la vida', 'quiero morir', 'quiero morirme',
        'no quiero vivir', 'ya no quiero estar aquí', 'acabar con todo', 'acabar con mi vida',
        'terminar con mi vida', 'hacerme daño', 'hacerme dano', 'lastimarme', 'matarme',
        'cortarme', 'autolesi', 'mejor muerto', 'mejor muerta', 'no vale la pena vivir',
    ];
    foreach ($claves as $c) {
        if (str_contains($t, $c)) return true;
    }
    return false;
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
