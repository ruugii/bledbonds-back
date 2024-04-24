const validator = require('validator');

const phoneValidator = async (phone) => {
    const emailError = [];
    if (!validator.isMobilePhone(phone)) {
        emailError.push('Invalid phone');
    }

    return emailError;
}

module.exports = phoneValidator;
