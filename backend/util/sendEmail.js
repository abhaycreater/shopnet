// const nodemailer = require('nodemailer')

// const sendEmail = async (to , subject , text)=>{
//     try{
//         const transporter = nodemailer.createTransport({
//             service:'gmail',
//             auth:{
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS
//             }
//         })
//         const mailOption = {
//             from : process.env.EMAIL_USER,
//             to,
//             subject,
//             text
//         }

//         const info = await transporter.sendMail(mailOption);

//         return info;
//     }catch(error){
//         console.error('Error sending mail: ', error);
//         throw error;
//     }
// }


// module.exports = sendEmail

const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,

      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },

      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.verify();

    console.log("SMTP connection successful!");

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return info;
  } catch (error) {
    console.log("Error sending mail:", error);
    throw error;
  }
};

module.exports = sendEmail;