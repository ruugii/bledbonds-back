CREATE TABLE IF NOT EXISTS `estado-civil` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `estado-civil` (`text`) VALUES
  ('Soltero'),
  ('En una relación'),
  ('Es complicado'),
  ('En una relacion abierta'),
  ('Preferiria no decir');