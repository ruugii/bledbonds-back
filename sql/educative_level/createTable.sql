CREATE TABLE IF NOT EXISTS educative_level (
  id INT NOT NULL AUTO_INCREMENT,
  text VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

INSERT INTO educative_level (text) VALUES 
  ('Secundaria'),
  ('Grado o superior'),
  ('Estudiando un postgrado'),
  ('Estudiando un grado'),
  ('Bachillerato o FP'),
  ('Prefiero no decirlo');
