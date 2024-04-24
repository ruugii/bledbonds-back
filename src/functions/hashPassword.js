var bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
    const result = await bcrypt.compare(password, hashedPassword);
    return result;
}

module.exports = { hashPassword, verifyPassword };
