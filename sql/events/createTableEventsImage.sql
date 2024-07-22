CREATE TABLE eventsImage (
    id INT AUTO_INCREMENT PRIMARY KEY,
    eventId INT NOT NULL,
    eventImageURL VARCHAR(255) NOT NULL,
    FOREIGN KEY (eventId) REFERENCES events(id),
);