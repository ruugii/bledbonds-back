const emailValidator = require("../validators/email-validator");
const passwordValidator = require("../validators/passwd-validator");
const phoneValidator = require("../validators/phone-validator");
const verifyRequiredParams = require("../verifyRequiredParams");
const genreValidator = require("../validators/genre-validator");
const nameValidator = require("../validators/name-validator");
const isMajor = require("../validators/isMajor-validator");
const pool = require("../../db/db");

const create = async (req, res, next) => {
    try {
        const requiredParams = ["email"];
        if (verifyRequiredParams(requiredParams, req, res) === 0) {
            const errors = [
                await emailValidator(req.body.email, 255, false),
            ];
            const filteredErrors = errors.filter(error => error.length > 0);
            const mappedErrors = filteredErrors.map((error, index) => ({ [index]: error }));
            const response = { message: "Validation errors", errors: mappedErrors };
            const [r] = await pool.query("SELECT * FROM newsletter WHERE email = ?", [req.body.email]);
            if (r.length > 0) return res.status(400).json({ message: "Email already registered" });
            if (errors.some(error => error.length > 0)) return res.status(400).json(response);
            return next();
        } else {
            return res.status(400).json({
                message: "Missing required params"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const activate = async (req, res, next) => {
    try {
        if (req.params.validateCode === undefined) return res.status(400).json({ message: "Missing required params" });
        if (`${req.params.validateCode}`.length !== 6) return res.status(400).json({ message: "Invalid validation code" });
        const [r] = await pool.query("SELECT * FROM users_activation WHERE validationCode = ?", [req.params.validateCode]);
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error});
    }
}

const deleteEmail = async (req, res, next) => {
    try {
        if (req.params.email === undefined) return res.status(400).json({ message: "Missing required params" });
        const errors = [
            await emailValidator(req.params.email, 255, false),
        ];
        const filteredErrors = errors.filter(error => error.length > 0);
        const mappedErrors = filteredErrors.map((error, index) => ({ [index]: error }));
        const response = { message: "Validation errors", errors: mappedErrors };
        if (errors.some(error => error.length > 0)) return res.status(400).json(response);
        const [r] = await pool.query("SELECT * FROM newsletter WHERE email = ?", [req.params.email]);
        if (r.length === 0) return res.status(400).json({ message: "Email not registered" });
        next();
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error});
    }
}

module.exports = {
    create,
    activate,
    deleteEmail
};