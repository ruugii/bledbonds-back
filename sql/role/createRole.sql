CREATE TABLE role (
    id INTEGER NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
);

INSERT INTO role (name, description) VALUES ('admin', 'Administrator');
INSERT INTO role (name, description) VALUES ('user', 'User');