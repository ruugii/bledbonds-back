const validator = require('validator');
const pool = require('../../db/db');

const emailValidator = async (email, max = 255) => {
    const emailError = [];
    if (!validator.isLength(email, { max })) {
        emailError.push('Email is too long');
    }
    if (!validator.isEmail(email)) {
        emailError.push('Invalid email');
    }
    let rows = [];
    [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
        emailError.push("The email is already used");
    }
    return emailError;
}

module.exports = emailValidator;
