const pool = require("../db/db");
const { hashPassword } = require("../functions/hashPassword");
const nodemailer = require('nodemailer');

const register = async (req, res) => {
    try {
        await pool.query('INSERT INTO `users`(`email`, `phone`, `passwd`, `isActive`, `id_genre`, `name`, `birthdate`, `id_find`, `id_orientation`, `id_status`, `bio`, `height`, `studyPlace`, `you_work`, `charge_work`, `enterprise`, `drink`, `educative_level_id`, `personality`, `id_zodiac`, `mascotas`, `id_religion`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.email, req.body.phone, await hashPassword(req.body.password), 0, await getIdGenre(req.body.genre), req.body.name, req.body.birthDate, req.body.idFind, req.body.idOrientation, req.body.idStatus, req.body.bio, req.body.height, req.body.studyPlace, req.body.youWork, req.body.chargeWork, req.body.enterprise, req.body.drink, req.body.educativeLevel, req.body.personality, req.body.idZodiac, req.body.mascotas, req.body.idReligion]);
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email]);
        const code = Math.floor(Math.random() * (999999 - 100000) + 100000);
        await pool.query('INSERT INTO `users_activation`(`id_user`, `validationCode`) VALUES (?, ?)', [rows[0].id, code]);
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.ionos.es',
                port: 587,
                secure: false,
                auth: {
                    user: 'noreply@order-now.es',
                    pass: 'rgrbrrr1'
                }
            });
            let mailOptions = {
                from: {
                    name: 'BledBonds',
                    address: 'noreply@order-now.es'
                },
                to: req.body.email,
                subject: 'Confirmación de registro en BledBonds',
                html: html(req.body.name, code)
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({
                        message: "Error sending email",
                        error: error
                    })
                } else {
                    return res.status(201).json({
                        message: "User created successfully"
                    });
                }
            });
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const html = (email) => {
    return (
        `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        body {
            background-color: #8afffd;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        div.container {
            margin: 15px;
        }

        .button {
            
            background: #04bbc8;
            border: none;
            color: #002b33;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>
            CONFIRMACION DE REGISTRO
        </h1>
        <p>
            Estimado ${email},
            <br>
            <br>
            ¡Bienvenido a nuestra comunidad!
            <br>
            <br>
            Nos complace informarte que tu registro a la newsletter ha sido completado exitosamente.
        </p>
    </div>
</body>
</html>
        `
    )
}

const getIdGenre = async (genre) => {
    let rows = [];
    [rows] = await pool.query('SELECT id FROM genre WHERE genre_name = ?', [genre]);

    return rows[0].id;
}

const activate = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users_activation WHERE validationCode = ?', [req.params.validateCode]);
        await pool.query('UPDATE users SET isActive = 1 WHERE id = ?', [rows[0].id_user]);
        await pool.query('DELETE FROM users_activation WHERE validationCode = ?', [req.params.validateCode]);
        return res.status(200).json({
            message: "User activated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

const create = async (req, res) => {
    try {
        await pool.query('INSERT INTO `newsletter`(`email`) VALUES (?)', [req.body.email]);
        nodemailer.createTestAccount((err, account) => {
            let transporter = nodemailer.createTransport({
                host: 'smtp.ionos.es',
                port: 587,
                secure: false,
                auth: {
                    user: 'noreply@order-now.es',
                    pass: 'rgrbrrr1'
                }
            });
            let mailOptions = {
                from: {
                    name: 'BledBonds',
                    address: 'noreply@order-now.es'
                },
                to: req.body.email,
                subject: 'Confirmación de registro en BledBonds',
                html: html(req.body.email)
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return res.status(500).json({
                        message: "Error sending email",
                        error: error
                    })
                } else {
                    return res.status(201).json({
                        message: "Email added to newsletter list"
                    });
                }
            });
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error
        });
    }
}

module.exports = {
    register,
    activate,
    create
}