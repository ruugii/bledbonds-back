CREATE TABLE users (
    -- `email`, `phone`, `passwd`, `isActive`, `id_genre`, `name`, `birthdate`, `id_find`, `id_orientation`, `id_status`, `bio`, `height`, `studyPlace`, `you_work`, `charge_work`, `enterprise`, `drink`, `educative_level_id`, `personality`, `id_zodiac`, `mascotas`, `id_religion`
    id INTEGER NOT NULL AUTO_INCREMENT,
    email VARCHAR(255),
    phone VARCHAR(9),
    passwd VARCHAR(255),
    isActive BOOLEAN,
    id_genre INTEGER,
    name VARCHAR(255),
    birthdate DATE,
    id_find INTEGER,
    id_orientation INTEGER,
    id_status INTEGER,
    bio TEXT,
    height INTEGER,
    studyPlace VARCHAR(255),
    you_work VARCHAR(255),
    charge_work VARCHAR(255),
    enterprise VARCHAR(255),
    drink BOOLEAN,
    educative_level_id INTEGER,
    personality TEXT,
    id_zodiac INTEGER,
    mascotas BOOLEAN,
    id_religion INTEGER,
    PRIMARY KEY (id),
    FOREIGN KEY (id_genre) REFERENCES genre(id)
)

ALTER TABLE users ADD FOREIGN KEY (id_find) REFERENCES find(id);
ALTER TABLE users ADD FOREIGN KEY (id_orientation) REFERENCES sexualidad(id);
ALTER TABLE users ADD FOREIGN KEY (id_status) REFERENCES `estado-civil`(id);
ALTER TABLE users ADD FOREIGN KEY (educative_level_id) REFERENCES educative_level(id);
ALTER TABLE users ADD FOREIGN KEY (id_zodiac) REFERENCES zodiac(id);
ALTER TABLE users ADD FOREIGN KEY (id_religion) REFERENCES religion(id);
