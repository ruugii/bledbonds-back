CREATE TABLE `actions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_action` int(11) NOT NULL,
  `id_liked` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`id_user`) REFERENCES `users` (`id`),
  FOREIGN KEY (`id_liked`) REFERENCES `users` (`id`)
)

ALTER TABLE `actions`
ADD COLUMN `date` DATE NOT NULL DEFAULT CURRENT_DATE;
