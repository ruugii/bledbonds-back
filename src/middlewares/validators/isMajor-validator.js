const validator = require('validator');

const isMajor = async (birthDate) => {
    const birthDateError = [];
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    if (age < 18) {
        birthDateError.push('You must be at least 18 years old');
    }
    if (birthDate > new Date()) {
        birthDateError.push('Invalid birth date');
    }
    return birthDateError;
}

module.exports = isMajor;