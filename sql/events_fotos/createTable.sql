CREATE TABLE events_fotos (
    id INTEGER NOT NULL AUTO_INCREMENT,
    event_id INTEGER,
    foto_id INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (event_id) REFERENCES events(id),
    FOREIGN KEY (foto_id) REFERENCES fotos(id)
);