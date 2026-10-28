USE emotion_db;

DROP TABLE IF EXISTS puntajes;

CREATE TABLE puntajes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  juego ENUM('memoria','rompecabezas','diana','escape') NOT NULL,
  puntaje INT UNSIGNED NOT NULL,
  tiempo_segundos INT UNSIGNED NOT NULL,
  UNIQUE KEY uq_usuario_juego (usuario_id, juego),
  INDEX idx_juego_puntaje (juego, puntaje)
) ENGINE=MyISAM;
