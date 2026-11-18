-- Contador de clics de los botones de ayuda (WhatsApp y Línea 106).
-- Ejecutar en phpMyAdmin sobre la base de datos emotion_db.

CREATE TABLE IF NOT EXISTS clics_ayuda (
    boton VARCHAR(20)  NOT NULL PRIMARY KEY,   -- la clave primaria es obligatoria para ON DUPLICATE KEY UPDATE
    total INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO clics_ayuda (boton, total) VALUES ('whatsapp', 0), ('linea106', 0);

-- Si la tabla YA existía sin clave y tiene filas repetidas, bórrala y vuelve a crearla:
-- DROP TABLE clics_ayuda;   (y luego ejecuta las dos sentencias de arriba)
