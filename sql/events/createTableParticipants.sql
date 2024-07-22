CREATE TABLE participants (
  id_participant INTEGER NOT NULL AUTO_INCREMENT,
  id_event INTEGER NOT NULL,
  id_user INTEGER NOT NULL,
  PRIMARY KEY (id_participant),
  FOREIGN KEY (id_event) REFERENCES events(id),
  FOREIGN KEY (id_user) REFERENCES users(id)
);