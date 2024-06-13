CREATE TABLE users_role (
    id INTEGER NOT NULL AUTO_INCREMENT,
    user_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE users_role
ADD CONSTRAINT fk_role_id
FOREIGN KEY (role_id) REFERENCES role(id);

ALTER TABLE users_role
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id) REFERENCES users(id);