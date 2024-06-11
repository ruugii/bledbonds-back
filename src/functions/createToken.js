const jwt = require('jsonwebtoken');

async function createToken(data) {
    const token = jwt.sign(data, process.env.JWT_SECRET);
    return token;
}

module.exports = { createToken };
