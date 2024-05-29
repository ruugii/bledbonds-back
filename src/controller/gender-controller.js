const pool = require("../db/db");
const { hashPassword } = require("../functions/hashPassword");

const getAll = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM genre');
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            path: "src/controller/genere-controller.js",
            error: error
        });
    }
}

module.exports = {
    getAll
}