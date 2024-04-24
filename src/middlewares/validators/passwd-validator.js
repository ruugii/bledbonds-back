const validator = require('validator');
const pool = require('../../db/db');

const passwordValidator = async (password) => {
    const passwordError = [];
    if (!validator.isLength(password, { min: 8, max: 12 })) {
        passwordError.push('Password must be between 8 and 12 characters long');
    }
    if (!validator.isStrongPassword(password)) {
        passwordError.push('Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character');
    }
    return passwordError;
}

module.exports = passwordValidator;
