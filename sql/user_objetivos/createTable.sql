CREATE TABLE user_objetivos (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  objetivo_id int(11) NOT NULL,
  PRIMARY KEY (id)
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (objetivo_id) REFERENCES objetivos(id)
)