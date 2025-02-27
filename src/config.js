const dotenv = require('dotenv')

const path = require('path')

dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'prod'}`)
})

const PORT = process.env.PORT
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME
const API_KEY = process.env.API_KEY
const SECRET_KEY = process.env.SECRET_KEY
const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY
const MONGO_URI = process.env.MONGO_URI
const DB_PORT = process.env.DB_PORT
const JWT_SECRET = process.env.JWT_SECRET
const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = process.env.SMTP_PORT
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS

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
  DB_PORT,
  JWT_SECRET,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_PORT,
  SMTP_USER
}
