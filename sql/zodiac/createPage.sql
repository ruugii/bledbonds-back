CREATE TABLE IF NOT EXISTS zodiac (
  id INTEGER NOT NULL AUTO_INCREMENT,
  text VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO zodiac (text) VALUES 
('Aquarius --- 20 de enero -> 18 de febrero'),
('Piscis --- 19 de febrero -> 20 de marzo'),
('Aries --- 21 de marzo -> 19 de abril'),
('Tauro --- 20 de abril -> 20 de mayo'),
('Gemini --- 21 de mayo -> 20 de junio'),
('Cancer -- 21 de junio -> 22 de julio'),
('Leo --- 23 de julio -> 22 de agosto'),
('Virgo --- 23 de agosto -> 22 de septiembre'),
('Libra --- 23 de septiembre -> 22 de octubre'),
('Scorpio --- 23 de octubre -> 21 de noviembre'),
('Sagitario --- 22 de noviembre -> 21 de diciembre'), 
('Capricornio --- 22 de diciembre -> 19 de enero');