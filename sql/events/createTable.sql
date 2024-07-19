CREATE TABLE events (
  id INTEGER NOT NULL AUTO_INCREMENT,
  event_name VARCHAR(255),
  event_date DATE,
  event_location VARCHAR(255),
  event_description TEXT,
  PRIMARY KEY (id)
);