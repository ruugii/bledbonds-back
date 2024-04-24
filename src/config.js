const config = require('dotenv').config()

const PORT = process.env.PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;
const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY;
const MONGO_URI = process.env.MONGO_URI;
const DB_PORT = process.env.DB_PORT;

module.exports = {
    PORT,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    API_KEY,
    SECRET_KEY,
    GOOGLE_SECRET_KEY,
    MONGO_URI,
    DB_PORT
};