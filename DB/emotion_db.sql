-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 18-11-2026 a las 14:52:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `emotion_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clics_ayuda`
--

CREATE TABLE `clics_ayuda` (
  `boton` varchar(20) NOT NULL,
  `total` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clics_ayuda`
--

INSERT INTO `clics_ayuda` (`boton`, `total`) VALUES
('whatsapp', 5),
('linea106', 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `filtros_crisis`
--

CREATE TABLE `filtros_crisis` (
  `id` int(10) UNSIGNED NOT NULL,
  `frase` varchar(100) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `filtros_crisis`
--

INSERT INTO `filtros_crisis` (`id`, `frase`, `creado_en`) VALUES
(1, 'suicid', '2026-11-03 04:22:17'),
(2, 'quitarme la vida', '2026-11-03 04:22:17'),
(3, 'quitarnos la vida', '2026-11-03 04:22:17'),
(4, 'quiero morir', '2026-11-03 04:22:17'),
(5, 'quiero morirme', '2026-11-03 04:22:17'),
(6, 'no quiero vivir', '2026-11-03 04:22:17'),
(7, 'ya no quiero estar aquí', '2026-11-03 04:22:17'),
(8, 'acabar con todo', '2026-11-03 04:22:17'),
(9, 'acabar con mi vida', '2026-11-03 04:22:17'),
(10, 'terminar con mi vida', '2026-11-03 04:22:17'),
(11, 'hacerme daño', '2026-11-03 04:22:17'),
(12, 'lastimarme', '2026-11-03 04:22:17'),
(13, 'matarme', '2026-11-03 04:22:17'),
(14, 'cortarme', '2026-11-03 04:22:17'),
(15, 'autolesi', '2026-11-03 04:22:17'),
(16, 'mejor muerto', '2026-11-03 04:22:17'),
(17, 'mejor muerta', '2026-11-03 04:22:17'),
(18, 'no vale la pena vivir', '2026-11-03 04:22:17'),
(32, 'Estoy cansado de vivir', '2026-11-03 04:29:15'),
(0, 'cutting', '2026-11-03 22:45:04'),
(0, 'me quiero qitar', '2026-11-11 19:58:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `contenido` varchar(200) NOT NULL,
  `estado` enum('visible','oculto','revision') NOT NULL DEFAULT 'visible',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `usuario_id`, `contenido`, `estado`, `creado_en`) VALUES
(11, 14, 'estoy mal', 'visible', '2026-11-04 13:29:03'),
(13, 18, 'quiero matarme', 'revision', '2026-11-09 13:27:01'),
(14, 18, 'voy acabar con mi vida', 'revision', '2026-11-09 13:27:37');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `puntajes`
--

CREATE TABLE `puntajes` (
  `id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `juego` enum('memoria','rompecabezas','diana','escape') NOT NULL,
  `puntaje` int(10) UNSIGNED NOT NULL,
  `tiempo_segundos` int(10) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `puntajes`
--

INSERT INTO `puntajes` (`id`, `usuario_id`, `juego`, `puntaje`, `tiempo_segundos`) VALUES
(2, 1, 'rompecabezas', 421, 22),
(3, 1, 'diana', 100, 30),
(4, 1, 'escape', 4220, 78),
(5, 2, 'rompecabezas', 339, 33),
(6, 3, 'memoria', 441, 17),
(7, 4, 'rompecabezas', 459, 8),
(8, 5, 'memoria', 510, 5),
(25, 35, 'memoria', 1692, 140),
(10, 11, 'memoria', 923, 17),
(11, 12, 'memoria', 443, 16),
(12, 13, 'memoria', 184, 2),
(22, 30, 'memoria', 366, 32),
(24, 34, 'memoria', 2520, 156),
(21, 26, 'rompecabezas', 1225, 80),
(20, 26, 'memoria', 1648, 147),
(23, 32, 'rompecabezas', 295, 80),
(19, 28, 'rompecabezas', 452, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes`
--

CREATE TABLE `reportes` (
  `id` int(10) UNSIGNED NOT NULL,
  `mensaje_id` int(10) UNSIGNED NOT NULL,
  `usuario_id` int(10) UNSIGNED NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `reportes`
--

INSERT INTO `reportes` (`id`, `mensaje_id`, `usuario_id`, `creado_en`) VALUES
(1, 2, 1, '2026-10-25 06:55:31'),
(2, 1, 1, '2026-10-25 06:55:48'),
(3, 5, 2, '2026-10-26 15:26:37'),
(4, 8, 13, '2026-11-03 18:45:30');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre_usuario` varchar(30) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `fecha_registro` date NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre_usuario`, `token_hash`, `fecha_registro`) VALUES
(33, 'isabella', '603bde0dd6eb5012752f653446e8a6c6ed6a482e2e1bf1db40775cb2a6eac538', '2026-11-12'),
(34, 'pepe2', 'a7dd0633178df0d28cbdec2624463efb279a9a64b73b090a60ef5899827d6269', '2026-11-12'),
(31, 'luis', 'f53044b09f35ca7b4502d4506b48bdb9558a080a2fdc8de0b33637a63f8b45c8', '2026-11-12'),
(32, 'emily', 'fd527ca13880f55da6f2e467bd8c47fbeca2fe426a2d205d4d664c26cf62463c', '2026-11-12'),
(29, 'Jugador41', '51e03025720f77115a24f65081aadb39945309f62f1244b36eb6da4fc2fec8f5', '2026-11-11'),
(30, 'vale', '6b12e3dcdcc71329c6473a17a4c166f5e6075e5de206ecd2f9bcb6a51be660d1', '2026-11-12'),
(12, 'sara123', '6fecf125719f68e91d8cfb92d3b9bc3e7314e69f88ebd5389ee0e8999439cd04', '2026-11-03'),
(13, 'jugador5', '5eecfea6dd1477fe29bb391537a237a97f8a22f633ceccda005334ed8bd681a2', '2026-11-03'),
(27, 'Pepito132', '3a1fa469f12a729b207bc0e6e5217652f4d4616085fedecb621867dd4d846b04', '2026-11-11'),
(15, 'Lily', 'e6cdb45b31909cfe0f804fce227a3973932a8ae02595308aab91b080e89e4560', '2026-11-04'),
(26, 'jugador202020', 'ebcaadc863322d329052a918fb119bceff3869aa1ca775068eb7f7413c972e7b', '2026-11-11'),
(35, 'valeria', '2cd98c05f0136aac66a6acdf91a3260bfcfb00221b10c4bc8ed6db8168671141', '2026-11-12'),
(36, 'Nicol', '9e1fdadb705db7386708993485cfc403ec51736508b0edcaf8c757f7a17ff832', '2026-11-18'),
(37, 'rafael', '658b706c3b6e055ab5f3467461457333866d3370ab95757750117537b5ccabb4', '2026-11-18'),
(38, 'jugador1', '0c0095131ab733363a07e910bf7ce8516b59ab10fca53599921dcdd718312b79', '2026-11-18'),
(39, 'jugador122', 'c47401507078eda3c4f0196b5535c168dca651118da17dc42b4c22ce4079588d', '2026-11-18');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clics_ayuda`
--
ALTER TABLE `clics_ayuda`
  ADD PRIMARY KEY (`boton`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_estado_id` (`estado`,`id`),
  ADD KEY `idx_usuario_fecha` (`usuario_id`,`creado_en`);

--
-- Indices de la tabla `puntajes`
--
ALTER TABLE `puntajes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_juego` (`usuario_id`,`juego`),
  ADD KEY `idx_juego_puntaje` (`juego`,`puntaje`);

--
-- Indices de la tabla `reportes`
--
ALTER TABLE `reportes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_reporte` (`mensaje_id`,`usuario_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre_usuario` (`nombre_usuario`),
  ADD KEY `idx_token` (`token_hash`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `puntajes`
--
ALTER TABLE `puntajes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `reportes`
--
ALTER TABLE `reportes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
