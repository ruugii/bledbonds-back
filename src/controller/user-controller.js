const { knowTokenData } = require('../functions/knowTokenData')
const pool = require('../db/db')
const { createToken } = require('../functions/createToken')
const { hashPassword, verifyPassword } = require('../functions/hashPassword')
const nodemailer = require('nodemailer')
const createLog = require('../functions/createLog')

const register = async (req, res) => {
  try {
    // Iniciar una transacción
    await pool.query('START TRANSACTION')

    // Encontrar el primer ID disponible
    let nextId

    // Obtener el ID mínimo y máximo existentes
    const [idRows] = await pool.query('SELECT MIN(id) AS minId, MAX(id) AS maxId FROM users FOR UPDATE')
    const minId = idRows[0].minId || 0
    const maxId = idRows[0].maxId || 0

    if (minId > 1) {
      // Si el ID mínimo es mayor que 1, el 1 está disponible
      nextId = 1
    } else {
      // Buscar el primer ID faltante en la secuencia
      const [missingIdRows] = await pool.query(`
        SELECT t1.id + 1 AS nextId
        FROM users t1
        LEFT JOIN users t2 ON t1.id + 1 = t2.id
        WHERE t2.id IS NULL
        ORDER BY t1.id
        LIMIT 1
        FOR UPDATE
      `)

      if (missingIdRows.length > 0) {
        nextId = missingIdRows[0].nextId
      } else {
        // Si no hay IDs faltantes, asignar el siguiente ID después del máximo existente
        nextId = maxId + 1
      }
    }

    // Insertar el nuevo usuario con el ID encontrado
    await pool.query(
      'INSERT INTO `users`(`id`, `email`, `phone`, `passwd`, `isActive`, `id_genre`, `name`, `birthdate`, `id_find`, `id_orientation`, `id_status`, `bio`, `height`, `studyPlace`, `you_work`, `charge_work`, `enterprise`, `drink`, `educative_level_id`, `personality`, `id_zodiac`, `mascotas`, `id_religion`, `lat`, `lon`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        nextId,
        req.body.email,
        req.body.phone,
        await hashPassword(req.body.password),
        0,
        await getIdGenre(req.body.genre),
        req.body.name,
        req.body.birthDate,
        req.body.idFind,
        req.body.idOrientation,
        req.body.idStatus,
        req.body.bio,
        req.body.height,
        req.body.studyPlace,
        req.body.youWork,
        req.body.chargeWork,
        req.body.enterprise,
        req.body.drink,
        req.body.educativeLevel,
        req.body.personality,
        req.body.idZodiac,
        req.body.mascotas,
        req.body.idReligion,
        req.body.lat,
        req.body.lon
      ]
    )

    // Actualizar el AUTO_INCREMENT si es necesario
    const [autoIncRows] = await pool.query('SELECT AUTO_INCREMENT FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = "users"')
    const currentAutoIncrement = autoIncRows[0].AUTO_INCREMENT

    if (nextId >= currentAutoIncrement) {
      await pool.query('ALTER TABLE users AUTO_INCREMENT = ?', [nextId + 1])
    }

    // Confirmar la transacción
    await pool.query('COMMIT')

    // Obtener los datos del usuario recién insertado
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [nextId])

    const code = Math.floor(Math.random() * (999999 - 100000) + 100000)
    let nextUserActivationId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `users_activation`')
    nextUserActivationId = nextUserActivationId[0].next_id
    await pool.query('INSERT INTO `users_activation`(id, `id_user`, `validationCode`) VALUES (?, ?, ?)', [nextUserActivationId, nextId, code])
    let nextUserRoleId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `users_role`')
    nextUserRoleId = nextUserRoleId[0].next_id
    await pool.query('INSERT INTO `users_role`(id, `user_id`, `role_id`) VALUES (?, ?, (SELECT id FROM role WHERE NAME LIKE "user"))', [nextUserRoleId, nextId])

    createLog(nextId, 'register user-controller - 98', 'Registro de usuario')

    // Configuración y envío del correo electrónico
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        return res.status(500).json({
          message: 'Error al crear la cuenta de correo',
          error: err.message
        })
      } else {
        const transporter = nodemailer.createTransport({
          host: 'smtp.ionos.es',
          port: 587,
          secure: false,
          auth: {
            user: 'noreply@bledbonds.es',
            pass: 'rgrbrrr1'
          }
        })
        const mailOptions = {
          from: {
            name: 'BledBonds',
            address: 'noreply@bledbonds.es'
          },
          to: userRows[0].email, // Usamos el email del usuario recién insertado
          subject: 'Confirmación de registro en BledBonds',
          html: html(userRows[0].name, code) // Usamos el nombre del usuario desde la base de datos
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({
              message: 'Error al enviar el correo electrónico',
              error
            })
          } else {
            return res.status(201).json({
              message: 'Usuario creado exitosamente'
            })
          }
        })
      }
    })
  } catch (error) {
    // Revertir la transacción en caso de error
    await pool.query('ROLLBACK')
    createLog('', 'register user-controller - 143', error)
    return res.status(500).json({
      message: 'Error interno del servidor',
      path: 'src/controller/user-controller.js',
      error
    })
  }
}

const html = (name, code) => {
  return (
    `
        <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html dir='ltr' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office' lang='es'>
 <head>
  <meta charset='UTF-8'>
  <meta content='width=device-width, initial-scale=1' name='viewport'>
  <meta name='x-apple-disable-message-reformatting'>
  <meta http-equiv='X-UA-Compatible' content='IE=edge'>
  <meta content='telephone=no' name='format-detection'>
  <title>Nuevo mensaje</title><!--[if (mso 16)]>
    <style type='text/css'>
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <style type='text/css'>
#outlook a {
padding:0;
}
.es-button {
mso-style-priority:100!important;
text-decoration:none!important;
}
a[x-apple-data-detectors] {
color:inherit!important;
text-decoration:none!important;
font-size:inherit!important;
font-family:inherit!important;
font-weight:inherit!important;
line-height:inherit!important;
}
.es-desk-hidden {
display:none;
float:left;
overflow:hidden;
width:0;
max-height:0;
line-height:0;
mso-hide:all;
}
@media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } h1 { font-size:36px!important; text-align:left } h2 { font-size:26px!important; text-align:left } h3 { font-size:20px!important; text-align:left } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:36px!important; text-align:left } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important; text-align:left } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important; text-align:left } .es-menu td a { font-size:12px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:14px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class='gmail-fix'] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:inline-block!important } a.es-button, button.es-button { font-size:20px!important; display:inline-block!important } .es-adaptive table, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } .es-m-p0l { padding-left:0!important } .es-m-p0t { padding-top:0!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
@media screen and (max-width:384px) {.mail-message-content { width:414px!important } }
</style>
 </head>
 <body style='width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0'>
  <div dir='ltr' class='es-wrapper-color' lang='es' style='background-color:#FAFAFA'><!--[if gte mso 9]>
<v:background xmlns:v='urn:schemas-microsoft-com:vml' fill='t'>
<v:fill type='tile' color='#fafafa'></v:fill>
</v:background>
<![endif]-->
   <table class='es-wrapper' width='100%' cellspacing='0' cellpadding='0' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA'>
     <tr>
      <td valign='top' style='padding:0;Margin:0'>
       <table cellpadding='0' cellspacing='0' class='es-content' align='center' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%'>
         <tr>
          <td class='es-info-area' align='center' style='padding:0;Margin:0'>
           <table class='es-content-body' align='center' cellpadding='0' cellspacing='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px' bgcolor='#FFFFFF' role='none'>
             <tr>
              <td align='left' style='padding:20px;Margin:0'>
               <table cellpadding='0' cellspacing='0' width='100%' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                 <tr>
                  <td align='center' valign='top' style='padding:0;Margin:0;width:560px'>
                   <table cellpadding='0' cellspacing='0' width='100%' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                     <tr>
                      <td align='center' class='es-infoblock' style='padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px'><a target='_blank' href='' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'>View online version</a></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding='0' cellspacing='0' class='es-header' align='center' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top'>
         <tr>
          <td align='center' style='padding:0;Margin:0'>
           <table bgcolor='#ffffff' class='es-header-body' align='center' cellpadding='0' cellspacing='0' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px'>
             <tr>
              <td align='left' style='Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px'>
               <table cellpadding='0' cellspacing='0' width='100%' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                 <tr>
                  <td class='es-m-p0r' valign='top' align='center' style='padding:0;Margin:0;width:560px'>
                   <table cellpadding='0' cellspacing='0' width='100%' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                     <tr>
                      <td align='center' style='padding:0;Margin:0;padding-bottom:20px;font-size:0px'><img src='https://ehlxqba.stripocdn.email/content/guids/CABINET_ee401c909f5b24d26d7c3bb30f7dd28e1cde5022e2212acbf16dedb85649a639/images/logo.png' alt='Logo' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px' title='Logo' width='48'></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding='0' cellspacing='0' class='es-content' align='center' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%'>
         <tr>
          <td align='center' style='padding:0;Margin:0'>
           <table bgcolor='#ffffff' class='es-content-body' align='center' cellpadding='0' cellspacing='0' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px'>
             <tr>
              <td align='left' style='Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px'>
               <table cellpadding='0' cellspacing='0' width='100%' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                 <tr>
                  <td align='center' valign='top' style='padding:0;Margin:0;width:560px'>
                   <table cellpadding='0' cellspacing='0' width='100%' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                     <tr>
                      <td align='center' style='padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px'><img src='https://ehlxqba.stripocdn.email/content/guids/CABINET_ee401c909f5b24d26d7c3bb30f7dd28e1cde5022e2212acbf16dedb85649a639/images/image.png' alt style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic' width='100'></td>
                     </tr>
                     <tr>
                      <td align='center' class='es-m-txt-c' style='padding:0;Margin:0;padding-bottom:10px'><h1 style='Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333'>CONFIRMA TU EMAIL</h1></td>
                     </tr>
                     <tr>
                      <td align='center' class='es-m-p0r es-m-p0l' style='Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>Recibiste este mensaje porque tu dirección de correo electrónico se registró en nuestro sitio. Haga clic en el botón a continuación para verificar su dirección de correo electrónico y confirmar que es el propietario de esta cuenta.</p></td>
                     </tr>
                     <tr>
                      <td align='center' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>Si no se registró con nosotros, ignore este correo electrónico.</p></td>
                     </tr>
                     <tr>
                      <td align='center' style='padding:0;Margin:0;padding-top:10px;padding-bottom:10px'>
                        <span class='es-button-border' style='border-style:solid;border-color:#2CB543;background:#5C68E2;border-width:0px;display:inline-block;border-radius:6px;width:auto'>
                          <a href='bledbonds.es/activation/${code}' class='es-button' target='_blank' style='mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:20px;padding:10px 30px 10px 30px;display:inline-block;background:#5C68E2;border-radius:6px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:24px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #5C68E2;padding-left:30px;padding-right:30px'>
                            CONFIRMA EL EMAIL
                          </a>
                        </span>
                      </td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding='0' cellspacing='0' class='es-footer' align='center' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top'>
         <tr>
          <td align='center' style='padding:0;Margin:0'>
           <table class='es-footer-body' align='center' cellpadding='0' cellspacing='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px' role='none'>
             <tr>
              <td align='left' style='Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px'>
               <table cellpadding='0' cellspacing='0' width='100%' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                 <tr>
                  <td align='left' style='padding:0;Margin:0;width:600px'>
                   <table cellpadding='0' cellspacing='0' width='100%' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                     <tr>
                      <td align='center' style='padding:0;Margin:0;padding-top:15px;padding-bottom:15px;font-size:0'>
                       <table cellpadding='0' cellspacing='0' class='es-table-not-adapt es-social' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                         <tr>
                          <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'><img title='Facebook' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/facebook-logo-black.png' alt='Fb' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'></td>
                          <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'><img title='Twitter' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/twitter-logo-black.png' alt='Tw' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'></td>
                          <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'><img title='Instagram' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png' alt='Inst' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'></td>
                          <td align='center' valign='top' style='padding:0;Margin:0'><img title='Youtube' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/youtube-logo-black.png' alt='Yt' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table>
       <table cellpadding='0' cellspacing='0' class='es-content' align='center' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%'>
         <tr>
          <td class='es-info-area' align='center' style='padding:0;Margin:0'>
           <table class='es-content-body' align='center' cellpadding='0' cellspacing='0' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px' bgcolor='#FFFFFF' role='none'>
             <tr>
              <td align='left' style='padding:20px;Margin:0'>
               <table cellpadding='0' cellspacing='0' width='100%' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                 <tr>
                  <td align='center' valign='top' style='padding:0;Margin:0;width:560px'>
                   <table cellpadding='0' cellspacing='0' width='100%' role='presentation' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                     <tr>
                      <td align='center' class='es-infoblock' style='padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px'><a target='_blank' href='' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'></a>No longer want to receive these emails?&nbsp;<a href='' target='_blank' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'>Unsubscribe</a>.<a target='_blank' href='' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'></a></p></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table></td>
         </tr>
       </table></td>
     </tr>
   </table>
  </div>
 </body>
</html>
        `
  )
}

const html_ = (code) => {
  return (
    `
        <!DOCTYPE html
  PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html dir='ltr' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office' lang='es'>

<head>
  <meta charset='UTF-8'>
  <meta content='width=device-width, initial-scale=1' name='viewport'>
  <meta name='x-apple-disable-message-reformatting'>
  <meta http-equiv='X-UA-Compatible' content='IE=edge'>
  <meta content='telephone=no' name='format-detection'>
  <title>Nuevo mensaje</title><!--[if (mso 16)]>
    <style type='text/css'>
    a {text-decoration: none;}
    </style>
    <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
<xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG></o:AllowPNG>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
</xml>
<![endif]-->
  <style type='text/css'>
    #outlook a {
      padding: 0;
    }

    .es-button {
      mso-style-priority: 100 !important;
      text-decoration: none !important;
    }

    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    .es-desk-hidden {
      display: none;
      float: left;
      overflow: hidden;
      width: 0;
      max-height: 0;
      line-height: 0;
      mso-hide: all;
    }

    @media only screen and (max-width:600px) {

      p,
      ul li,
      ol li,
      a {
        line-height: 150% !important
      }

      h1,
      h2,
      h3,
      h1 a,
      h2 a,
      h3 a {
        line-height: 120%
      }

      h1 {
        font-size: 36px !important;
        text-align: left
      }

      h2 {
        font-size: 26px !important;
        text-align: left
      }

      h3 {
        font-size: 20px !important;
        text-align: left
      }

      .es-header-body h1 a,
      .es-content-body h1 a,
      .es-footer-body h1 a {
        font-size: 36px !important;
        text-align: left
      }

      .es-header-body h2 a,
      .es-content-body h2 a,
      .es-footer-body h2 a {
        font-size: 26px !important;
        text-align: left
      }

      .es-header-body h3 a,
      .es-content-body h3 a,
      .es-footer-body h3 a {
        font-size: 20px !important;
        text-align: left
      }

      .es-menu td a {
        font-size: 12px !important
      }

      .es-header-body p,
      .es-header-body ul li,
      .es-header-body ol li,
      .es-header-body a {
        font-size: 14px !important
      }

      .es-content-body p,
      .es-content-body ul li,
      .es-content-body ol li,
      .es-content-body a {
        font-size: 16px !important
      }

      .es-footer-body p,
      .es-footer-body ul li,
      .es-footer-body ol li,
      .es-footer-body a {
        font-size: 14px !important
      }

      .es-infoblock p,
      .es-infoblock ul li,
      .es-infoblock ol li,
      .es-infoblock a {
        font-size: 12px !important
      }

      *[class='gmail-fix'] {
        display: none !important
      }

      .es-m-txt-c,
      .es-m-txt-c h1,
      .es-m-txt-c h2,
      .es-m-txt-c h3 {
        text-align: center !important
      }

      .es-m-txt-r,
      .es-m-txt-r h1,
      .es-m-txt-r h2,
      .es-m-txt-r h3 {
        text-align: right !important
      }

      .es-m-txt-l,
      .es-m-txt-l h1,
      .es-m-txt-l h2,
      .es-m-txt-l h3 {
        text-align: left !important
      }

      .es-m-txt-r img,
      .es-m-txt-c img,
      .es-m-txt-l img {
        display: inline !important
      }

      .es-button-border {
        display: inline-block !important
      }

      a.es-button,
      button.es-button {
        font-size: 20px !important;
        display: inline-block !important
      }

      .es-adaptive table,
      .es-left,
      .es-right {
        width: 100% !important
      }

      .es-content table,
      .es-header table,
      .es-footer table,
      .es-content,
      .es-footer,
      .es-header {
        width: 100% !important;
        max-width: 600px !important
      }

      .es-adapt-td {
        display: block !important;
        width: 100% !important
      }

      .adapt-img {
        width: 100% !important;
        height: auto !important
      }

      .es-m-p0 {
        padding: 0 !important
      }

      .es-m-p0r {
        padding-right: 0 !important
      }

      .es-m-p0l {
        padding-left: 0 !important
      }

      .es-m-p0t {
        padding-top: 0 !important
      }

      .es-m-p0b {
        padding-bottom: 0 !important
      }

      .es-m-p20b {
        padding-bottom: 20px !important
      }

      .es-mobile-hidden,
      .es-hidden {
        display: none !important
      }

      tr.es-desk-hidden,
      td.es-desk-hidden,
      table.es-desk-hidden {
        width: auto !important;
        overflow: visible !important;
        float: none !important;
        max-height: inherit !important;
        line-height: inherit !important
      }

      tr.es-desk-hidden {
        display: table-row !important
      }

      table.es-desk-hidden {
        display: table !important
      }

      td.es-desk-menu-hidden {
        display: table-cell !important
      }

      .es-menu td {
        width: 1% !important
      }

      table.es-table-not-adapt,
      .esd-block-html table {
        width: auto !important
      }

      table.es-social {
        display: inline-block !important
      }

      table.es-social td {
        display: inline-block !important
      }

      .es-m-p5 {
        padding: 5px !important
      }

      .es-m-p5t {
        padding-top: 5px !important
      }

      .es-m-p5b {
        padding-bottom: 5px !important
      }

      .es-m-p5r {
        padding-right: 5px !important
      }

      .es-m-p5l {
        padding-left: 5px !important
      }

      .es-m-p10 {
        padding: 10px !important
      }

      .es-m-p10t {
        padding-top: 10px !important
      }

      .es-m-p10b {
        padding-bottom: 10px !important
      }

      .es-m-p10r {
        padding-right: 10px !important
      }

      .es-m-p10l {
        padding-left: 10px !important
      }

      .es-m-p15 {
        padding: 15px !important
      }

      .es-m-p15t {
        padding-top: 15px !important
      }

      .es-m-p15b {
        padding-bottom: 15px !important
      }

      .es-m-p15r {
        padding-right: 15px !important
      }

      .es-m-p15l {
        padding-left: 15px !important
      }

      .es-m-p20 {
        padding: 20px !important
      }

      .es-m-p20t {
        padding-top: 20px !important
      }

      .es-m-p20r {
        padding-right: 20px !important
      }

      .es-m-p20l {
        padding-left: 20px !important
      }

      .es-m-p25 {
        padding: 25px !important
      }

      .es-m-p25t {
        padding-top: 25px !important
      }

      .es-m-p25b {
        padding-bottom: 25px !important
      }

      .es-m-p25r {
        padding-right: 25px !important
      }

      .es-m-p25l {
        padding-left: 25px !important
      }

      .es-m-p30 {
        padding: 30px !important
      }

      .es-m-p30t {
        padding-top: 30px !important
      }

      .es-m-p30b {
        padding-bottom: 30px !important
      }

      .es-m-p30r {
        padding-right: 30px !important
      }

      .es-m-p30l {
        padding-left: 30px !important
      }

      .es-m-p35 {
        padding: 35px !important
      }

      .es-m-p35t {
        padding-top: 35px !important
      }

      .es-m-p35b {
        padding-bottom: 35px !important
      }

      .es-m-p35r {
        padding-right: 35px !important
      }

      .es-m-p35l {
        padding-left: 35px !important
      }

      .es-m-p40 {
        padding: 40px !important
      }

      .es-m-p40t {
        padding-top: 40px !important
      }

      .es-m-p40b {
        padding-bottom: 40px !important
      }

      .es-m-p40r {
        padding-right: 40px !important
      }

      .es-m-p40l {
        padding-left: 40px !important
      }

      .es-desk-hidden {
        display: table-row !important;
        width: auto !important;
        overflow: visible !important;
        max-height: inherit !important
      }
    }

    @media screen and (max-width:384px) {
      .mail-message-content {
        width: 414px !important
      }
    }
  </style>
</head>

<body style='width:100%;font-family:arial, ' helvetica neue', helvetica,
  sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0'>
  <div dir='ltr' class='es-wrapper-color' lang='es' style='background-color:#FAFAFA'><!--[if gte mso 9]>
<v:background xmlns:v='urn:schemas-microsoft-com:vml' fill='t'>
<v:fill type='tile' color='#fafafa'></v:fill>
</v:background>
<![endif]-->
    <table class='es-wrapper' width='100%' cellspacing='0' cellpadding='0' role='none'
      style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA'>
      <tr>
        <td valign='top' style='padding:0;Margin:0'>
          <table cellpadding='0' cellspacing='0' class='es-content' align='center' role='none'
            style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%'>
            <tr>
              <td class='es-info-area' align='center' style='padding:0;Margin:0'>
                <table class='es-content-body' align='center' cellpadding='0' cellspacing='0'
                  style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px'
                  bgcolor='#FFFFFF' role='none'>
                  <tr>
                    <td align='left' style='padding:20px;Margin:0'>
                      <table cellpadding='0' cellspacing='0' width='100%' role='none'
                        style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                        <tr>
                          <td align='center' valign='top' style='padding:0;Margin:0;width:560px'>
                            <table cellpadding='0' cellspacing='0' width='100%' role='presentation'
                              style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                              <tr>
                                <td align='center' class='es-infoblock'
                                  style='padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC'>
                                  <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;line-height:14px;color:#CCCCCC;font-size:12px'><a target='_blank' href=''
                                      style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'>View
                                      online version</a></p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding='0' cellspacing='0' class='es-header' align='center' role='none'
            style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top'>
            <tr>
              <td align='center' style='padding:0;Margin:0'>
                <table bgcolor='#ffffff' class='es-header-body' align='center' cellpadding='0' cellspacing='0'
                  role='none'
                  style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px'>
                  <tr>
                    <td align='left'
                      style='Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px'>
                      <table cellpadding='0' cellspacing='0' width='100%' role='none'
                        style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                        <tr>
                          <td class='es-m-p0r' valign='top' align='center' style='padding:0;Margin:0;width:560px'>
                            <table cellpadding='0' cellspacing='0' width='100%' role='presentation'
                              style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                              <tr>
                                <td align='center' style='padding:0;Margin:0;padding-bottom:20px;font-size:0px'><img
                                    src='https://ehlxqba.stripocdn.email/content/guids/CABINET_ee401c909f5b24d26d7c3bb30f7dd28e1cde5022e2212acbf16dedb85649a639/images/logo.png'
                                    alt='Logo'
                                    style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;font-size:12px'
                                    title='Logo' width='48'></td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding='0' cellspacing='0' class='es-content' align='center' role='none'
            style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%'>
            <tr>
              <td align='center' style='padding:0;Margin:0'>
                <table bgcolor='#ffffff' class='es-content-body' align='center' cellpadding='0' cellspacing='0'
                  role='none'
                  style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px'>
                  <tr>
                    <td align='left'
                      style='Margin:0;padding-left:20px;padding-right:20px;padding-top:30px;padding-bottom:30px'>
                      <table cellpadding='0' cellspacing='0' width='100%' role='none'
                        style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                        <tr>
                          <td align='center' valign='top' style='padding:0;Margin:0;width:560px'>
                            <table cellpadding='0' cellspacing='0' width='100%' role='presentation'
                              style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                              <tr>
                                <td align='center' class='es-m-txt-c' style='padding:0;Margin:0;padding-bottom:10px'>
                                  <h1 style='Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333'>CODIGO DE LOGIN</h1>
                                </td>
                              </tr>
                              <tr>
                                <td align='center' class='es-m-p0r es-m-p0l'
                                  style='Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px'>
                                  <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;line-height:21px;color:#333333;font-size:14px'>Hemos recibido una solicitud para acceder a tu cuenta en BledBonds. Utiliza el siguiente código de verificación para completar el proceso de inicio de sesión:</p>
                                </td>
                              </tr>
                              <tr>
                                <td align='center' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                  <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;line-height:21px;color:#333333;font-size:14px'>Código de Verificación: ${code}</p>
                                </td>
                              </tr>
                              <tr>
                                <td align='center' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                  <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;line-height:21px;color:#333333;font-size:14px'>Por favor, ingresa este código en la plataforma para continuar. Este código es válido por 10 minutos. Si no solicitaste este código, por favor ignora este correo electrónico.</p>
                                </td>
                              </tr>
                              <tr>
                                <td align='center' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                  <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, '
                                    helvetica neue', helvetica,
                                    sans-serif;line-height:21px;color:#333333;font-size:14px'>Para tu seguridad, no compartas este código con nadie.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <table cellpadding='0' cellspacing='0' class='es-footer' align='center' role='none'
            style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top'>
            <tr>
              <td align='center' style='padding:0;Margin:0'>
                <table class='es-footer-body' align='center' cellpadding='0' cellspacing='0'
                  style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:640px'
                  role='none'>
                  <tr>
                    <td align='left'
                      style='Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px'>
                      <table cellpadding='0' cellspacing='0' width='100%' role='none'
                        style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                        <tr>
                          <td align='left' style='padding:0;Margin:0;width:600px'>
                            <table cellpadding='0' cellspacing='0' width='100%' role='presentation'
                              style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                              <tr>
                                <td align='center'
                                  style='padding:0;Margin:0;padding-top:15px;padding-bottom:15px;font-size:0'>
                                  <table cellpadding='0' cellspacing='0' class='es-table-not-adapt es-social'
                                    role='presentation'
                                    style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px'>
                                    <tr>
                                      <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'><img
                                          title='Instagram'
                                          src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png'
                                          alt='Inst' width='32'
                                          style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
        `
  )
}

const getIdGenre = async (genre) => {
  let rows = [];
  [rows] = await pool.query('SELECT id FROM genre WHERE genre_name = ?', [genre])

  return rows[0].id
}

const activate = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users_activation WHERE validationCode = ?', [req.params.validateCode])
    await pool.query('UPDATE users SET isActive = 1 WHERE id = ?', [rows[0].id_user])
    await pool.query('DELETE FROM users_activation WHERE validationCode = ?', [req.params.validateCode])
    createLog(rows[0].id_user, 'activate user-controller - 1001', 'Activación de usuario')
    return res.status(200).json({
      message: 'User activated successfully'
    })
  } catch (error) {
    createLog('', 'activate user-controller - 1006', error)
    res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/user-controller.js',
      error
    })
  }
}

const login = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (rows[0].isActive === 0) {
      return res.status(401).json({
        message: 'User not activated'
      })
    }
    if (await verifyPassword(req.body.password, rows[0].passwd)) {
      const [role_] = await pool.query('SELECT * FROM role WHERE id = (SELECT role_id FROM users_role WHERE user_id = ?)', [rows[0].id])
      if (role_.length === 0) {
        role_.push({ name: '' })
      }
      const token = await createToken({
        id: rows[0].id,
        email: rows[0].email,
        data: rows[0],
        role: role_[0].name
      })
      const [imageRows] = await pool.query('SELECT image FROM user_image WHERE user_id = ?', [rows[0].id])
      const perfilCompleto = await rows[0].id_find !== null && rows[0].id_orientation !== null && rows[0].id_status !== null && rows[0].bio !== null && imageRows.length > 0
      createLog(rows[0].id, 'login user-controller - 1041', `Login de usuario ${rows[0].email}`)
      return res.status(200).json({
        message: 'User logged in successfully',
        token,
        role: role_[0].name,
        id: rows[0].id,
        image: imageRows,
        perfilCompleto
      })
    } else {
      return res.status(401).json({
        message: 'Invalid password'
      })
    }
  } catch (error) {
    createLog('', 'login user-controller - 1056', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT users.*, genre.genre_name AS genre_name, role.name AS roleName, find.text AS findText, sexualidad.text AS orientationText, `estado-civil`.text AS statusText, CASE WHEN delete_form.email IS NOT NULL AND delete_form.phone IS NOT NULL THEN true ELSE false END AS deleted FROM users JOIN genre ON users.id_genre = genre.id LEFT JOIN users_role ON users.id = users_role.user_id LEFT JOIN role ON users_role.role_id = role.id LEFT JOIN find ON users.id_find = find.id LEFT JOIN sexualidad ON users.id_orientation = sexualidad.id LEFT JOIN `estado-civil` ON users.id_status = `estado-civil`.id LEFT JOIN delete_form ON users.email = delete_form.email AND users.phone = delete_form.phone;')
    rows.forEach(async element => {
      delete element.passwd
      delete element.isActive

      Object.keys(element).forEach(key => {
        if (element[key] === null) {
          element[key] = `No especificado el ${key}`
        }
      })
      element.id_genre = element.genre_name
      delete element.genre_name
    })

    const reorderKeys = (obj) => {
      const {
        id,
        email,
        phone,
        id_genre,
        name,
        birthdate,
        roleName,
        id_find,
        id_orientation,
        id_status,
        bio,
        height,
        studyPlace,
        you_work,
        charge_work,
        enterprise,
        drink,
        educative_level_id,
        personality,
        id_zodiac,
        mascotas,
        id_religion,
        findText,
        orientationText,
        statusText,
        ...rest
      } = obj
      return {
        id,
        email,
        phone,
        id_genre,
        name,
        birthdate,
        roleName,
        findText,
        orientationText,
        statusText,
        bio,
        height,
        studyPlace,
        you_work,
        charge_work,
        enterprise,
        drink,
        educative_level_id,
        personality,
        id_zodiac,
        mascotas,
        id_religion,
        ...rest
      }
    }

    const reorderedRows = rows.map(reorderKeys)
    createLog('', 'list user-controller - 1137', `Listado de usuarios`)
    return res.status(200).json({
      users: reorderedRows
    })
  } catch (error) {
    createLog('', 'list user-controller - 1142', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const loginByCode = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (rows[0].isActive === 0) {
      return res.status(401).json({
        message: 'User not activated'
      })
    }
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000)
    let nextUser2faId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `users_2fa`')
    nextUser2faId = nextUser2faId[0].next_id
    await pool.query('INSERT INTO `users_2fa`(id, `id_user`, `validationCode`) VALUES (?, ?, ?)', [nextUser2faId, rows[0].id, code])
    createLog(rows[0].id, 'loginByCode user-controller - 1167', `Login por código de verificación de ${rows[0].email}`)
    // Mandar codigo por email
    const transporter = nodemailer.createTransport({
      host: 'smtp.ionos.es',
      port: 587,
      secure: false,
      auth: {
        user: 'noreply@bledbonds.es',
        pass: 'rgrbrrr1'
      }
    })
    const mailOptions = {
      from: {
        name: 'BledBonds',
        address: 'noreply@bledbonds.es'
      },
      to: req.body.email,
      subject: 'Tu Código de Verificación',
      html: html_(code)
    }
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({
          message: 'Error sending email',
          error
        })
      } else {
        return res.status(201).json({
          message: 'User created successfully'
        })
      }
    })
  } catch (error) {
    createLog('', 'loginByCode user-controller - 1200', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const loginByCode2 = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (rows[0].isActive === 0) {
      return res.status(401).json({
        message: 'User not activated'
      })
    }
    const [rows2] = await pool.query('SELECT * FROM users_2fa WHERE id_user = ? AND validationCode = ?', [rows[0].id, req.params.code])
    if (rows2.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    } else {
      await pool.query('DELETE FROM users_2fa WHERE id_user = ?', [rows[0].id])
      const token = await createToken({
        id: rows[0].id,
        email: rows[0].email,
        data: rows[0]
      })
      const [role_] = await pool.query('SELECT name FROM role WHERE id = (SELECT role_id FROM users_role WHERE user_id = ?)', [rows[0].id])
      createLog(rows[0].id, 'loginByCode2 user-controller - 1234', `Login por código de verificación de ${rows[0].email}`)
      return res.status(200).json({
        message: 'User logged in successfully',
        token,
        role: role_[0]
      })
    }
  } catch (error) {
    createLog('', 'loginByCode2 user-controller - 1242', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const isPerfilCompleto = async (req, res) => {
  try {
    const userToken = req.headers['user-token']
    const { id } = knowTokenData(userToken)
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (rows[0].isActive === 0) {
      return res.status(401).json({
        message: 'User not activated'
      })
    }
    const [imageRows] = await pool.query('SELECT image FROM user_image WHERE user_id = ?', [id])
    const perfilCompleto = await rows[0].id_find !== null && rows[0].id_orientation !== null && rows[0].id_status !== null && rows[0].bio !== null && imageRows.length > 0
    createLog(id, 'isPerfilCompleto user-controller - 1267', `Verificación de perfil completo de usuario ${rows[0].email}`)
    return res.status(200).json({
      message: 'Perfil completo',
      perfilCompleto
    })
  } catch (error) {
    createLog('', 'isPerfilCompleto user-controller - 1273', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const update = async (req, res) => {
  try {
    const userToken = req.headers['user-token']
    const { id } = knowTokenData(userToken)

    const fieldsToUpdate = {}
    const validFields = [
      'email', 'phone', 'name', 'birthdate', 'id_find', 'id_orientation',
      'id_status', 'bio', 'height', 'studyPlace', 'you_work', 'charge_work',
      'enterprise', 'drink', 'educative_level_id', 'personality', 'id_zodiac',
      'mascotas', 'id_religion', 'lat', 'lon'
    ]

    validFields.forEach(field => {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field]
      }
    })

    if (Object.keys(fieldsToUpdate).length > 0) {
      const setClause = Object.keys(fieldsToUpdate)
        .map((field, index) => `${field} = ?`)
        .join(', ')
      const values = Object.values(fieldsToUpdate)

      values.push(id)

      await pool.query(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      )
    }

    if (req.body.photo) {
      let nextUserImageId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `user_image`')
      nextUserImageId = nextUserImageId[0].next_id
      await pool.query('INSERT INTO user_image(id, user_id, image) VALUES (?, ?, ?)', [nextUserImageId, id, req.body.photo])
    }

    if (req.body.language) {
      const [currentLangs] = await pool.query('SELECT lang_id FROM user_lang WHERE user_id = ?', [id])

      const currentLangIds = currentLangs.map(lang => lang.lang_id)
      const newLangIds = req.body.language

      const langIdsToInsert = newLangIds.filter(langId => !currentLangIds.includes(langId))
      const langIdsToDelete = currentLangIds.filter(langId => !newLangIds.includes(langId))

      if (langIdsToInsert.length > 0) {
        for (const langId of langIdsToInsert) {
          let nextUserLangId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `user_lang`')
          nextUserLangId = nextUserLangId[0].next_id
          await pool.query('INSERT INTO user_lang(id, user_id, lang_id) VALUES (?, ?, ?)', [nextUserLangId, id, langId])
        }
      }

      if (langIdsToDelete.length > 0) {
        for (const langId of langIdsToDelete) {
          await pool.query(
            'DELETE FROM user_lang WHERE user_id = ? AND lang_id = ?',
            [id, langId]
          )
        }
      }
    }
    createLog(id, 'update user-controller - 1346', `Actualización de usuario ${id}`)
    return res.status(200).json({
      message: 'User updated successfully'
    })
  } catch (error) {
    createLog('', 'update user-controller - 1351', error.toString())
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getToken = async (req, res) => {
  try {
    const userToken = req.headers['user-token']
    const { id } = knowTokenData(userToken)
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
    const [langRows] = await pool.query('SELECT * FROM user_lang WHERE user_id = ?', [id])
    const [photo] = await pool.query('SELECT * FROM user_image WHERE user_id = ?', [id])
    rows[0].language = langRows.map(lang => lang.lang_id)
    rows[0].photos = photo.map(photo => photo.image)
    if (rows.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    if (rows[0].isActive === 0) {
      return res.status(401).json({
        message: 'User not activated'
      })
    }
    createLog(rows[0].id, 'getToken user-controller - 1378', `Obtención de token de usuario ${rows[0].email}`)
    return res.status(200).json({
      message: 'Token',
      user_info: rows[0]
    })
  } catch (error) {
    createLog('', 'getToken user-controller - 1384', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const calcGenreId = (id, genre) => {
  if (id === 1 && genre === 1) {
    return 2
  } else if (id === 1 && genre === 2) {
    return 1
  } else if (id === 2 && genre === 1) {
    return 1
  } else if (id === 3 && genre === 2) {
    return 2
  } else if (id === 4) {
    return 0
  } else if (id === 5) {
    return 0
  } else if (id === 6) {
    return 0
  } else if (id === 7) {
    return 0
  } else if (id === 8) {
    return 0
  } else {
    return 0
  }
}

const getToLike = async (req, res) => {
  try {
    let fotos = []
    let userRandom = []
    let count = 0
    for (let i = 0; i < 2; i++) {
      do {
        const userToken = req.headers['user-token']
        const data = knowTokenData(userToken).data
        const id = data.id
        const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [id])
        const [count_] = await pool.query('SELECT COUNT(*) FROM actions WHERE id_action = 1 AND date_insert = CURRENT_DATE AND id_user = ?;', [id])
        count = count_
        const idOrientation = user[0].id_orientation
        const idGenre = user[0].id_genre
        const genreId = calcGenreId(idOrientation, idGenre)
        let userRandom_
        if (genreId === 0) {
          [userRandom_] = await pool.query('SELECT * FROM users WHERE id != ? AND id NOT IN (SELECT id_liked FROM actions WHERE id_user = ?) ORDER BY RAND() LIMIT 50', [id, id])
        } else {
          [userRandom_] = await pool.query('SELECT * FROM users WHERE id != ? AND id NOT IN (SELECT id_liked FROM actions WHERE id_user = ?) AND id_genre = ? ORDER BY RAND() LIMIT 50', [id, id, genreId])
        }
        if (userRandom_.length === 0) {
          return res.status(404).json({
            message: 'No more users to like'
          })
        }
        const [foto] = await pool.query('SELECT * FROM user_image WHERE user_id = ?', [userRandom_[0].id])
        fotos = foto
        userRandom = userRandom_
        const fotoAux = foto.map(foto => foto.image)
        userRandom[0].fotos = fotoAux
      } while (fotos.length === 0)
    }
    createLog(id, 'getToLike user-controller - 1450', `Obtención de "To Like" de usuario ${rows[0].email}`)
    return res.status(200).json({
      message: 'To like',
      userRandom,
      count
    })
  } catch (error) {
    createLog('', 'getToLike user-controller - 1457', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const deleteUser = async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE ID_User = ?', [req.params.id])
    if (user.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    } else {
      await pool.query('DELETE FROM users WHERE ID_User = ?', [req.params.id])
      return res.status(200).json({
        message: 'User deleted'
      })
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const getMatchList = async (req, res) => {
  try {
    const userToken = req.headers['user-token']
    const data = knowTokenData(userToken).data
    const id = data.id
    const [rows] = await pool.query('SELECT a1.id_user AS u1 FROM actions a1 JOIN actions a2 ON a1.id_user = a2.id_liked AND a1.id_liked = a2.id_user WHERE a1.id_action = 1 AND a2.id_action = 1 AND (a1.id_user = ? OR a1.id_liked = ?)', [id, id])
    const [count] = await pool.query('SELECT COUNT(*) FROM actions WHERE id_action = 1 AND date_insert = CURRENT_DATE AND id_user = ?;', [id])
    const matchList = []
    for (const row of rows) {
      if (row.u1 === id) {
        continue
      } else {
        const [rows2] = await pool.query('SELECT users.*, genre.genre_name, role.name AS roleName, find.text AS findText, sexualidad.text AS orientationText, `estado-civil`.text AS statusText FROM users JOIN genre ON users.id_genre = genre.id LEFT JOIN users_role ON users.id = users_role.user_id LEFT JOIN role ON users_role.role_id = role.id LEFT JOIN find ON users.id_find = find.id LEFT JOIN sexualidad ON users.id_orientation = sexualidad.id LEFT JOIN `estado-civil` ON users.id_status = `estado-civil`.id WHERE users.id = ?;', [row.u1])
        const [foto] = await pool.query('SELECT * FROM user_image WHERE user_id = ?', [rows2[0].id])
        const fotoAux = foto.map(foto => foto.image)
        rows2[0].fotos = fotoAux
        const [link] = await pool.query('SELECT uc1.ID_chat FROM user_chat uc1 JOIN user_chat uc2 ON uc1.ID_chat = uc2.ID_chat WHERE uc1.ID_user = ? AND uc2.ID_user = ?;', [rows2[0].id, id])
        rows2[0].link = link[0].ID_chat
        matchList.push(rows2[0])
      }
    }
    createLog(id, 'getMatchList user-controller - 1507', `Obtención de "Match List" de usuario ${rows[0].email}`)
    return res.status(200).json({
      message: 'Match list',
      matchList,
      count
    })
  } catch (error) {
    createLog('', 'getMatchList user-controller - 1514', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const createTestUser = async (req, res) => {
  try {
    const { numUsers } = req.params

    // Consulta a las tablas necesarias
    const [genders] = await pool.query('SELECT * FROM genre')
    const [findOptions] = await pool.query('SELECT * FROM find')
    const [orientations] = await pool.query('SELECT * FROM sexualidad')
    const [statuses] = await pool.query('SELECT * FROM `estado-civil`')
    const [religions] = await pool.query('SELECT * FROM religion')
    const [zodiacs] = await pool.query('SELECT * FROM zodiac')
    const [educationLevels] = await pool.query('SELECT * FROM educative_level')

    // Iniciar una transacción
    await pool.query('START TRANSACTION')

    for (let i = 0; i < numUsers; i++) {
      // Datos aleatorios
      const gender = genders[Math.floor(Math.random() * genders.length)].id
      const name = `${Math.random().toString(36).substring(2, 7)}-test`
      const birthdate = new Date(
        1970 + Math.floor(Math.random() * 30), // Año entre 1970 y 2000
        Math.floor(Math.random() * 12), // Mes
        Math.floor(Math.random() * 28) + 1 // Día
      )
      const idFind = findOptions[Math.floor(Math.random() * findOptions.length)].id
      const email = `${name.toLowerCase()}@gmail.com`
      const phone = Math.floor(600000000 + Math.random() * 400000000) // Número de teléfono válido
      const password = await hashPassword(Math.random().toString(36).substring(2, 7))
      const orientation = orientations[Math.floor(Math.random() * orientations.length)].id
      const idStatus = statuses[Math.floor(Math.random() * statuses.length)].id
      const bio = Math.random().toString(36).substring(2, 50) // Bio con longitud mayor
      const height = Math.floor(Math.random() * 50) + 150 // Altura entre 150cm y 200cm
      const studyPlace = `School-${Math.random().toString(36).substring(2, 7)}`
      const youWork = `Job-${Math.random().toString(36).substring(2, 7)}`
      const chargeWork = `Position-${Math.random().toString(36).substring(2, 7)}`
      const enterprise = `Enterprise-${Math.random().toString(36).substring(2, 7)}`
      const drink = Math.random() < 0.5 // true o false para bebida
      const educativeLevel = educationLevels[Math.floor(Math.random() * educationLevels.length)].id
      const personality = Math.random().toString(36).substring(2, 50)
      const idZodiac = zodiacs[Math.floor(Math.random() * zodiacs.length)].id
      const mascotas = Math.random() < 0.5 // true o false para mascotas
      const idReligion = religions[Math.floor(Math.random() * religions.length)].id
      const image = 'https://picsum.photos/200/300'
      const [nextId] = await pool.query('SELECT MAX(id) FROM users')
      const id = nextId[0]['MAX(id)'] + 1

      // Inserción del usuario con el ID específico
      await pool.query(
        'INSERT INTO `users`(id, `email`, `phone`, `passwd`, `isActive`, `id_genre`, `name`, `birthdate`, `id_find`, `id_orientation`, `id_status`, `bio`, `height`, `studyPlace`, `you_work`, `charge_work`, `enterprise`, `drink`, `educative_level_id`, `personality`, `id_zodiac`, `mascotas`, `id_religion`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          email,
          phone,
          password,
          1,
          gender,
          name,
          birthdate,
          idFind,
          orientation,
          idStatus,
          bio,
          height,
          studyPlace,
          youWork,
          chargeWork,
          enterprise,
          drink,
          educativeLevel,
          personality,
          idZodiac,
          mascotas,
          idReligion
        ]
      )
      // Insertar imagen del usuario
      let nextUserImageId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `user_image`')
      nextUserImageId = nextUserImageId[0].next_id
      await pool.query('INSERT INTO user_image(id, user_id, image) VALUES (?, ?, ?)', [nextUserImageId, id, image])
    }

    // Confirmar la transacción
    await pool.query('COMMIT')
    createLog('', 'createTestUser user-controller - 1606', `Creación de ${numUsers} usuarios`)
    return res.status(200).json({
      message: `${numUsers} users created successfully`
    })
  } catch (error) {
    createLog('', 'createTestUser user-controller - 1611', error)
    // Revertir la transacción en caso de error
    await pool.query('ROLLBACK')
    console.error('Error creating test users:', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const deleteForm = async (req, res) => {
  try {
    const { email, phone } = req.body
    const [user] = await pool.query('SELECT * FROM users WHERE email = ? AND phone = ?', [email, phone])
    if (user.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    let nextDeleteFormId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `delete_form`')
    nextDeleteFormId = nextDeleteFormId[0].next_id
    await pool.query('INSERT INTO `delete_form`(id, `email`, `phone`) VALUES (?, ?, ?)', [nextDeleteFormId, email, phone])
    createLog(user[0].id, 'deleteForm user-controller - 1634', `Formulario de eliminación de usuario ${user[0].email}`)
    return res.status(200).json({
      message: 'Form sent'
    })
  } catch (error) {
    createLog('', 'deleteForm user-controller - 1639', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

const deletePhoto = async (req, res) => {
  try {
    const userToken = req.headers['user-token']
    const photo = req.body.photo
    const user = knowTokenData(userToken).data
    const [user_] = await pool.query('SELECT * FROM users WHERE id = ?', [user.id])
    if (user_.length === 0) {
      return res.status(404).json({
        message: 'User not found'
      })
    }
    const [photoFromUser] = await pool.query('SELECT * FROM user_image WHERE user_id = ? AND image = ?', [user.id, photo])
    if (photoFromUser.length === 0) {
      return res.status(404).json({
        message: 'Photo not found'
      })
    }
    await pool.query('DELETE FROM user_image WHERE user_id = ? AND image = ?', [user.id, photo])
    createLog(user.id, 'deletePhoto user-controller - 1665', `Foto eliminada de usuario ${user.email}`)
    return res.status(200).json({
      message: 'Photo deleted'
    })
  } catch (error) {
    createLog('', 'deletePhoto user-controller - 1670', error)
    return res.status(500).json({
      message: 'Internal server error',
      error
    })
  }
}

module.exports = {
  list,
  login,
  update,
  register,
  activate,
  getToken,
  getToLike,
  deleteUser,
  deleteForm,
  loginByCode,
  deletePhoto,
  getMatchList,
  loginByCode2,
  createTestUser,
  isPerfilCompleto
}
