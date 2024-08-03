CREATE TABLE IF NOT EXISTS `sexualidad` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `text` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `sexualidad` (`text`) VALUES
  ('Heterosexual'),
  ('Gay'),
  ('Lesbiana'),
  ('Bisexual'),
  ('Asexual'),
  ('Demisexual'),
  ('Pansexual'),
  ('Queer'),
  ('En cuestionamiento'),
  ('Preferiria no decir');
