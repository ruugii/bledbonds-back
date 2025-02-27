const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = require('../config')
const pool = require('../db/db')
const createLog = require('../functions/createLog')
const { getRandomToken } = require('../functions/getRandomToken')
const { hashPassword } = require('../functions/hashPassword')
const nodemailer = require('nodemailer')

const register = async (req, res) => {
  try {
    let nextUserId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `users`')
    nextUserId = nextUserId[0].next_id
    await pool.query('INSERT INTO `users`(id, `email`, `phone`, `passwd`, `isActive`, `id_genre`, `name`, `birthdate`, `id_find`, `id_orientation`, `id_status`, `bio`, `height`, `studyPlace`, `you_work`, `charge_work`, `enterprise`, `drink`, `educative_level_id`, `personality`, `id_zodiac`, `mascotas`, `id_religion`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [nextUserId, req.body.email, req.body.phone, await hashPassword(req.body.password), 0, await getIdGenre(req.body.genre), req.body.name, req.body.birthDate, req.body.idFind, req.body.idOrientation, req.body.idStatus, req.body.bio, req.body.height, req.body.studyPlace, req.body.youWork, req.body.chargeWork, req.body.enterprise, req.body.drink, req.body.educativeLevel, req.body.personality, req.body.idZodiac, req.body.mascotas, req.body.idReligion])
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [req.body.email])
    const code = Math.floor(Math.random() * (999999 - 100000) + 100000)
    let nextUserActivationId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `users_activation`')
    nextUserActivationId = nextUserActivationId[0].next_id
    await pool.query('INSERT INTO `users_activation`(id, `id_user`, `validationCode`) VALUES (?, ?, ?)', [nextUserActivationId, rows[0].id, code])
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        return res.status(500).json({
          message: 'Error sending email',
          error: err.message
        })
      } else {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: false,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        })
        const mailOptions = {
          from: {
            name: 'BledBonds',
            address: 'noreply@bledbonds.es'
          },
          to: req.body.email,
          subject: 'Confirmación de registro en BledBonds',
          html: html(req.body.name, code)
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({
              message: 'Error sending email',
              error: error
            })
          } else {
            return res.status(201).json({
              message: 'User created successfully'
            })
          }
        })
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error: error
    })
  }
}

const html = (email, token) => {
  return (
    `
        <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html dir='ltr' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office' lang='und'>
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
<div dir='ltr' class='es-wrapper-color' lang='und' style='background-color:#FAFAFA'><!--[if gte mso 9]>
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
                      <td align='center' style='padding:0;Margin:0;padding-top:10px;padding-bottom:10px;font-size:0px'><img src='https://ehlxqba.stripocdn.email/content/guids/CABINET_ee401c909f5b24d26d7c3bb30f7dd28e1cde5022e2212acbf16dedb85649a639/images/image_1_.png' alt style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic' width='100'></td>
                     </tr>
                     <tr>
                      <td align='center' class='es-m-txt-c' style='padding:0;Margin:0;padding-bottom:10px'><h1 style='Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333'>GRACIAS POR ACCEDER A LA NEWSLETTER</h1></td>
                     </tr>
                     <tr>
                      <td align='center' class='es-m-p0r es-m-p0l' style='Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>¡Bienvenido a nuestra comunidad!</p></td>
                     </tr>
                     <tr>
                      <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>Queremos agradecerte por suscribirte a nuestra newsletter. Estamos encantados de tenerte con nosotros y estamos seguros de que disfrutarás del contenido exclusivo, las últimas noticias y las ofertas especiales que compartiremos contigo.</p></td>
                     </tr>
                     <tr>
                      <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'><strong>¿Qué puedes esperar de nuestra newsletter?</strong></p></td>
                     </tr>
                     <tr>
                      <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                       <ul>
                        <li style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px'><strong>Contenido Exclusivo:</strong> Acceso a artículos, guías y recursos que no encontrarás en ningún otro lugar.</li>
                        <li style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px'><strong>Noticias y Actualizaciones:</strong> Mantente al día con las últimas novedades de nuestra empresa y del sector.</li>
                        <li style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px'><strong>Ofertas Especiales:</strong> Promociones y descuentos exclusivos solo para nuestros suscriptores.</li>
                       </ul></td>
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
                          <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'>
                            <a target='_blank' href='https://www.instagram.com/bledbonds_app/' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:14px'>
                              <img title='Instagram' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png' alt='Inst' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'>
                            </a>
                          </td>
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
                      <td align='center' class='es-infoblock' style='padding:0;Margin:0;line-height:14px;font-size:12px;color:#CCCCCC'><p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:14px;color:#CCCCCC;font-size:12px'><a target='_blank' href='' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'></a>¿Ya no quieres recibir estos correos electrónicos?&nbsp;<a href='bledbonds.es/newsletter/delete/${token}' target='_blank' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'>Unsubscribe</a>.<a target='_blank' href='' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#CCCCCC;font-size:12px'></a></p></td>
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

const html_ = (title, text) => {
  return (
    `
        <!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html dir='ltr' xmlns='http://www.w3.org/1999/xhtml' xmlns:o='urn:schemas-microsoft-com:office:office' lang='und'>
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
/* CONFIG STYLES Please do not delete and edit CSS styles below */
/* IMPORTANT THIS STYLES MUST BE ON FINAL EMAIL */
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

/*
END OF IMPORTANT
*/
body {
    width: 100%;
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
}

table {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    border-collapse: collapse;
    border-spacing: 0px;
}

table td,
body,
.es-wrapper {
    padding: 0;
    Margin: 0;
}

.es-content,
.es-header,
.es-footer {
    table-layout: fixed !important;
    width: 100%;
}

img {
    display: block;
    border: 0;
    outline: none;
    text-decoration: none;
    -ms-interpolation-mode: bicubic;
}

p,
hr {
    Margin: 0;
}

h1,
h2,
h3,
h4,
h5 {
    Margin: 0;
    line-height: 120%;
    mso-line-height-rule: exactly;
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
}

p,
ul li,
ol li,
a {
    -webkit-text-size-adjust: none;
    -ms-text-size-adjust: none;
    mso-line-height-rule: exactly;
}

.es-left {
    float: left;
}

.es-right {
    float: right;
}

.es-p5 {
    padding: 5px;
}

.es-p5t {
    padding-top: 5px;
}

.es-p5b {
    padding-bottom: 5px;
}

.es-p5l {
    padding-left: 5px;
}

.es-p5r {
    padding-right: 5px;
}

.es-p10 {
    padding: 10px;
}

.es-p10t {
    padding-top: 10px;
}

.es-p10b {
    padding-bottom: 10px;
}

.es-p10l {
    padding-left: 10px;
}

.es-p10r {
    padding-right: 10px;
}

.es-p15 {
    padding: 15px;
}

.es-p15t {
    padding-top: 15px;
}

.es-p15b {
    padding-bottom: 15px;
}

.es-p15l {
    padding-left: 15px;
}

.es-p15r {
    padding-right: 15px;
}

.es-p20 {
    padding: 20px;
}

.es-p20t {
    padding-top: 20px;
}

.es-p20b {
    padding-bottom: 20px;
}

.es-p20l {
    padding-left: 20px;
}

.es-p20r {
    padding-right: 20px;
}

.es-p25 {
    padding: 25px;
}

.es-p25t {
    padding-top: 25px;
}

.es-p25b {
    padding-bottom: 25px;
}

.es-p25l {
    padding-left: 25px;
}

.es-p25r {
    padding-right: 25px;
}

.es-p30 {
    padding: 30px;
}

.es-p30t {
    padding-top: 30px;
}

.es-p30b {
    padding-bottom: 30px;
}

.es-p30l {
    padding-left: 30px;
}

.es-p30r {
    padding-right: 30px;
}

.es-p35 {
    padding: 35px;
}

.es-p35t {
    padding-top: 35px;
}

.es-p35b {
    padding-bottom: 35px;
}

.es-p35l {
    padding-left: 35px;
}

.es-p35r {
    padding-right: 35px;
}

.es-p40 {
    padding: 40px;
}

.es-p40t {
    padding-top: 40px;
}

.es-p40b {
    padding-bottom: 40px;
}

.es-p40l {
    padding-left: 40px;
}

.es-p40r {
    padding-right: 40px;
}

.es-menu td {
    border: 0;
}

.es-menu td a img {
    display: inline-block !important;
    vertical-align: middle;
}

/*
END CONFIG STYLES
*/
s {
    text-decoration: line-through;
}

p,
ul li,
ol li {
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
    line-height: 150%;
}

ul li,
ol li {
    Margin-bottom: 15px;
    margin-left: 0;
}

a {
    text-decoration: underline;
}

.es-menu td a {
    text-decoration: none;
    display: block;
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
}

.es-wrapper {
    width: 100%;
    height: 100%;
    background-repeat: repeat;
    background-position: center top;
}

.es-wrapper-color,
.es-wrapper {
    background-color: #fafafa;
}

.es-header {
    background-color: transparent;
    background-repeat: repeat;
    background-position: center top;
}

.es-header-body {
    background-color: transparent;
}

.es-header-body p,
.es-header-body ul li,
.es-header-body ol li {
    color: #333333;
    font-size: 14px;
}

.es-header-body a {
    color: #666666;
    font-size: 14px;
}

.es-content-body {
    background-color: #ffffff;
}

.es-content-body p,
.es-content-body ul li,
.es-content-body ol li {
    color: #333333;
    font-size: 14px;
}

.es-content-body a {
    color: #5c68e2;
    font-size: 14px;
}

.es-footer {
    background-color: transparent;
    background-repeat: repeat;
    background-position: center top;
}

.es-footer-body {
    background-color: #ffffff;
}

.es-footer-body p,
.es-footer-body ul li,
.es-footer-body ol li {
    color: #333333;
    font-size: 12px;
}

.es-footer-body a {
    color: #333333;
    font-size: 12px;
}

.es-infoblock,
.es-infoblock p,
.es-infoblock ul li,
.es-infoblock ol li {
    line-height: 120%;
    font-size: 12px;
    color: #cccccc;
}

.es-infoblock a {
    font-size: 12px;
    color: #cccccc;
}

h1 {
    font-size: 46px;
    font-style: normal;
    font-weight: bold;
    color: #333333;
}

h2 {
    font-size: 26px;
    font-style: normal;
    font-weight: bold;
    color: #333333;
}

h3 {
    font-size: 20px;
    font-style: normal;
    font-weight: bold;
    color: #333333;
}

.es-header-body h1 a,
.es-content-body h1 a,
.es-footer-body h1 a {
    font-size: 46px;
}

.es-header-body h2 a,
.es-content-body h2 a,
.es-footer-body h2 a {
    font-size: 26px;
}

.es-header-body h3 a,
.es-content-body h3 a,
.es-footer-body h3 a {
    font-size: 20px;
}

a.es-button,
button.es-button {
    padding: 10px 30px 10px 30px;
    display: inline-block;
    background: #5c68e2;
    border-radius: 0px;
    font-size: 20px;
    font-family: arial, 'helvetica neue', helvetica, sans-serif;
    font-weight: normal;
    font-style: normal;
    line-height: 120%;
    color: #ffffff;
    text-decoration: none;
    width: auto;
    text-align: center;
    mso-padding-alt: 0;
    mso-border-alt: 10px solid #5c68e2;
}

.es-button-border {
    border-style: solid solid solid solid;
    border-color: #2cb543 #2cb543 #2cb543 #2cb543;
    background: #5c68e2;
    border-width: 0px 0px 0px 0px;
    display: inline-block;
    border-radius: 0px;
    width: auto;
}

/* RESPONSIVE STYLES Please do not delete and edit CSS styles below. If you don't need responsive layout, please delete this section. */
@media only screen and (max-width: 600px) {

    p,
    ul li,
    ol li,
    a {
        line-height: 150% !important;
    }

    h1,
    h2,
    h3,
    h1 a,
    h2 a,
    h3 a {
        line-height: 120%;
    }

    h1 {
        font-size: 36px !important;
        text-align: left;
    }

    h2 {
        font-size: 26px !important;
        text-align: left;
    }

    h3 {
        font-size: 20px !important;
        text-align: left;
    }

    .es-header-body h1 a,
    .es-content-body h1 a,
    .es-footer-body h1 a {
        font-size: 36px !important;
        text-align: left;
    }

    .es-header-body h2 a,
    .es-content-body h2 a,
    .es-footer-body h2 a {
        font-size: 26px !important;
        text-align: left;
    }

    .es-header-body h3 a,
    .es-content-body h3 a,
    .es-footer-body h3 a {
        font-size: 20px !important;
        text-align: left;
    }

    .es-menu td a {
        font-size: 12px !important;
    }

    .es-header-body p,
    .es-header-body ul li,
    .es-header-body ol li,
    .es-header-body a {
        font-size: 14px !important;
    }

    .es-content-body p,
    .es-content-body ul li,
    .es-content-body ol li,
    .es-content-body a {
        font-size: 16px !important;
    }

    .es-footer-body p,
    .es-footer-body ul li,
    .es-footer-body ol li,
    .es-footer-body a {
        font-size: 14px !important;
    }

    .es-infoblock p,
    .es-infoblock ul li,
    .es-infoblock ol li,
    .es-infoblock a {
        font-size: 12px !important;
    }

    *[class="gmail-fix"] {
        display: none !important;
    }

    .es-m-txt-c,
    .es-m-txt-c h1,
    .es-m-txt-c h2,
    .es-m-txt-c h3 {
        text-align: center !important;
    }

    .es-m-txt-r,
    .es-m-txt-r h1,
    .es-m-txt-r h2,
    .es-m-txt-r h3 {
        text-align: right !important;
    }

    .es-m-txt-l,
    .es-m-txt-l h1,
    .es-m-txt-l h2,
    .es-m-txt-l h3 {
        text-align: left !important;
    }

    .es-m-txt-r img,
    .es-m-txt-c img,
    .es-m-txt-l img {
        display: inline !important;
    }

    .es-button-border {
        display: inline-block !important;
    }

    a.es-button,
    button.es-button {
        font-size: 20px !important;
        display: inline-block !important;
    }

    .es-adaptive table,
    .es-left,
    .es-right {
        width: 100% !important;
    }

    .es-content table,
    .es-header table,
    .es-footer table,
    .es-content,
    .es-footer,
    .es-header {
        width: 100% !important;
        max-width: 600px !important;
    }

    .es-adapt-td {
        display: block !important;
        width: 100% !important;
    }

    .adapt-img {
        width: 100% !important;
        height: auto !important;
    }

    .es-m-p0 {
        padding: 0 !important;
    }

    .es-m-p0r {
        padding-right: 0 !important;
    }

    .es-m-p0l {
        padding-left: 0 !important;
    }

    .es-m-p0t {
        padding-top: 0 !important;
    }

    .es-m-p0b {
        padding-bottom: 0 !important;
    }

    .es-m-p20b {
        padding-bottom: 20px !important;
    }

    .es-mobile-hidden,
    .es-hidden {
        display: none !important;
    }

    tr.es-desk-hidden,
    td.es-desk-hidden,
    table.es-desk-hidden {
        width: auto !important;
        overflow: visible !important;
        float: none !important;
        max-height: inherit !important;
        line-height: inherit !important;
    }

    tr.es-desk-hidden {
        display: table-row !important;
    }

    table.es-desk-hidden {
        display: table !important;
    }

    td.es-desk-menu-hidden {
        display: table-cell !important;
    }

    .es-menu td {
        width: 1% !important;
    }

    table.es-table-not-adapt,
    .esd-block-html table {
        width: auto !important;
    }

    table.es-social {
        display: inline-block !important;
    }

    table.es-social td {
        display: inline-block !important;
    }

    .es-m-p5 {
        padding: 5px !important;
    }

    .es-m-p5t {
        padding-top: 5px !important;
    }

    .es-m-p5b {
        padding-bottom: 5px !important;
    }

    .es-m-p5r {
        padding-right: 5px !important;
    }

    .es-m-p5l {
        padding-left: 5px !important;
    }

    .es-m-p10 {
        padding: 10px !important;
    }

    .es-m-p10t {
        padding-top: 10px !important;
    }

    .es-m-p10b {
        padding-bottom: 10px !important;
    }

    .es-m-p10r {
        padding-right: 10px !important;
    }

    .es-m-p10l {
        padding-left: 10px !important;
    }

    .es-m-p15 {
        padding: 15px !important;
    }

    .es-m-p15t {
        padding-top: 15px !important;
    }

    .es-m-p15b {
        padding-bottom: 15px !important;
    }

    .es-m-p15r {
        padding-right: 15px !important;
    }

    .es-m-p15l {
        padding-left: 15px !important;
    }

    .es-m-p20 {
        padding: 20px !important;
    }

    .es-m-p20t {
        padding-top: 20px !important;
    }

    .es-m-p20r {
        padding-right: 20px !important;
    }

    .es-m-p20l {
        padding-left: 20px !important;
    }

    .es-m-p25 {
        padding: 25px !important;
    }

    .es-m-p25t {
        padding-top: 25px !important;
    }

    .es-m-p25b {
        padding-bottom: 25px !important;
    }

    .es-m-p25r {
        padding-right: 25px !important;
    }

    .es-m-p25l {
        padding-left: 25px !important;
    }

    .es-m-p30 {
        padding: 30px !important;
    }

    .es-m-p30t {
        padding-top: 30px !important;
    }

    .es-m-p30b {
        padding-bottom: 30px !important;
    }

    .es-m-p30r {
        padding-right: 30px !important;
    }

    .es-m-p30l {
        padding-left: 30px !important;
    }

    .es-m-p35 {
        padding: 35px !important;
    }

    .es-m-p35t {
        padding-top: 35px !important;
    }

    .es-m-p35b {
        padding-bottom: 35px !important;
    }

    .es-m-p35r {
        padding-right: 35px !important;
    }

    .es-m-p35l {
        padding-left: 35px !important;
    }

    .es-m-p40 {
        padding: 40px !important;
    }

    .es-m-p40t {
        padding-top: 40px !important;
    }

    .es-m-p40b {
        padding-bottom: 40px !important;
    }

    .es-m-p40r {
        padding-right: 40px !important;
    }

    .es-m-p40l {
        padding-left: 40px !important;
    }

    .es-desk-hidden {
        display: table-row !important;
        width: auto !important;
        overflow: visible !important;
        max-height: inherit !important;
    }
}

/* END RESPONSIVE STYLES */
</style>
</head>
<body style='width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0'>
<div dir='ltr' class='es-wrapper-color' lang='und' style='background-color:#FAFAFA'><!--[if gte mso 9]>
<v:background xmlns:v='urn:schemas-microsoft-com:vml' fill='t'>
<v:fill type='tile' color='#fafafa'></v:fill>
</v:background>
<![endif]-->
   <table class='es-wrapper' width='100%' cellspacing='0' cellpadding='0' role='none' style='mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FAFAFA'>
     <tr>
      <td valign='top' style='padding:0;Margin:0'>
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
                      <td align='center' class='es-m-txt-c' style='padding:0;Margin:0;padding-bottom:10px'><h1 style='Margin:0;line-height:46px;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-size:46px;font-style:normal;font-weight:bold;color:#333333'>${title}</h1></td>
                     </tr>
                     ${text.map((t, i) => {
      if (t.includes('<td ')) {
        return (
          `<tr>
                              ${t}
                            </tr>`
        )
      } else if (t.startsWith('-') && t.replace('-', '').trim().startsWith('<b>')) {
        return (
          `<tr>
                              <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>
                                  <ul>
                                    <li style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px'>
                                      <b>
                                      ${t.replace('-', '').replace('<b>', '').replace('</b>', '')}
                                      </b>
                                    </li>
                                  </ul>
                                </p>
                              </td>
                            </tr>`
        )
      } else if (t.startsWith('-')) {
        return (
          `<tr>
                              <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>
                                  <ul>
                                    <li style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;Margin-bottom:15px;margin-left:0;color:#333333;font-size:14px'>
                                      ${t.replace('-', '')}
                                    </li>
                                  </ul>
                                </p>
                              </td>
                            </tr>`
        )
      } else {
        return (
          `<tr>
                              <td align='left' style='padding:0;Margin:0;padding-bottom:5px;padding-top:10px'>
                                <p style='Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, helvetica neue, helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px'>
                                  ${t}
                                </p>
                              </td>
                            </tr>`
        )
      }
    }).join('')}
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
                          <td align='center' valign='top' style='padding:0;Margin:0;padding-right:40px'>
                            <a target='_blank' href='https://www.instagram.com/bledbonds_app/' style='-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:14px'>
                              <img title='Instagram' src='https://ehlxqba.stripocdn.email/content/assets/img/social-icons/logo-black/instagram-logo-black.png' alt='Inst' width='32' style='display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic'>
                            </a>
                          </td>
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
    return res.status(200).json({
      message: 'User activated successfully'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error: error
    })
  }
}

const create = async (req, res) => {
  try {
    const token = getRandomToken()
    let nextNewsletterId = await pool.query('SELECT COALESCE(MAX(id) + 1, 1) AS next_id FROM `newsletter`')
    nextNewsletterId = nextNewsletterId[0].next_id
    await pool.query('INSERT INTO `newsletter`(id, `email`, `token`) VALUES (?, ?, ?)', [nextNewsletterId, req.body.email, token])
    createLog(0, 'create newsletter-controller - 1317', `Creación de newsletter de ${req.body.email}`)
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        return res.status(500).json({
          message: 'Error sending email',
          error: err.message
        })
      } else {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: false,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        })
        const mailOptions = {
          from: {
            name: 'BledBonds',
            address: 'noreply@bledbonds.es'
          },
          to: req.body.email,
          subject: 'Confirmación de registro en BledBonds',
          html: html(req.body.email, token)
        }
        try {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return res.status(500).json({
                message: 'Error sending email',
                error: error.message
              })
            } else {
              return res.status(201).json({
                message: 'Email added to newsletter list'
              })
            }
          })
        } catch (error) {
          return res.status(500).json({
            message: 'Internal server error',
            error: error.message
          })
        }
      }
    })
  } catch (error) {
    createLog('', 'create newsletter-controller - 1365', error)
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error
    })
  }
}

const deleteEmail = async (req, res) => {
  try {
    await pool.query('DELETE FROM newsletter WHERE token = ?', [req.params.email])
    createLog(0, 'deleteEmail newsletter-controller - 1377', `Eliminación de newsletter de ${req.params.email}`)
    return res.status(200).json({
      message: 'Email deleted from newsletter list'
    })
  } catch (error) {
    createLog('', 'deleteEmail newsletter-controller - 1382', error)
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error: error
    })
  }
}

const list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM newsletter')
    createLog(0, 'list newsletter-controller - 1394', `Listado de newsletters`)
    return res.status(200).json(rows)
  } catch (error) {
    createLog('', 'list newsletter-controller - 1397', error)
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
}

const sendTest = async (req, res) => {
  try {
    createLog(0, 'sendTest newsletter-controller - 1406', `Envio de prueba de newsletter a ${req.body.email}`)
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        return res.status(500).json({
          message: 'Error sending email',
          error: err.message
        })
      } else {
        const transporter = nodemailer.createTransport({
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: false,
          auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
          }
        })
        const mailOptions = {
          from: {
            name: 'BledBonds',
            address: 'noreply@bledbonds.es'
          },
          to: 'roger.barrero.sorribas@gmail.com',
          subject: req.body.subject,
          html: html_(req.body.title, req.body.text)
        }
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({
              message: 'Error sending email',
              error: error
            })
          } else {
            return res.status(201).json({
              message: 'User created successfully'
            })
          }
        })
      }
    })
  } catch (error) {
    createLog('', 'sendTest newsletter-controller - 1447', error)
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error: error
    })
  }
}

const send = async (req, res) => {
  try {
    const [email] = await pool.query('SELECT email FROM newsletter')
    let errorSendEmail = false
    const errorMsg = []
    for (let i = 0; i < email.length; i++) {
      nodemailer.createTestAccount((err, account) => {
        if (err) {
          return res.status(500).json({
            message: 'Error sending email',
            error: err.message
          })
        } else {
          const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: false,
            auth: {
              user: SMTP_USER,
              pass: SMTP_PASS
            }
          })
          const mailOptions = {
            from: {
              name: 'BledBonds',
              address: 'noreply@bledbonds.es'
            },
            to: email[i].email,
            subject: req.body.subject,
            html: html_(req.body.title, req.body.text)
          }
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              errorSendEmail = true
              errorMsg.push({
                email: email[i],
                error: error
              })
            }
          })
        }
      })
    }
    createLog(0, 'send newsletter-controller - 1499', `Envio de newsletter a los usuarios suscritos`)
    if (errorSendEmail) {
      return res.status(500).json({
        message: 'Error sending email',
        error: errorMsg
      })
    } else {
      return res.status(201).json({
        message: 'Email sent successfully'
      })
    }
  } catch (error) {
    createLog('', 'send newsletter-controller - 1511', error)
    return res.status(500).json({
      message: 'Internal server error',
      path: 'src/controller/newsletter-controller.js',
      error: error
    })
  }
}

module.exports = {
  register,
  activate,
  create,
  deleteEmail,
  list,
  sendTest,
  send
}
