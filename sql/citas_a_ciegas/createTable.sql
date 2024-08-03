CREATE TABLE IF NOT EXISTS `citas_a_ciegas` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `ID_User` int(11) NOT NULL,
  PRIMARY KEY (`ID`),
  FOREIGN KEY (`ID_User`) REFERENCES `users` (`ID`)
)