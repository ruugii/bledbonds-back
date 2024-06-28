CREATE table users_2fa (
  id INTEGER NOT NULL AUTO_INCREMENT,
  id_user INTEGER,
  validationCode VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY (id_user) REFERENCES users(id)
);