import nodemailer from 'nodemailer';

const user = process.env.GMAIL_USER;
const pass = process.env.GMAIL_APP_PASSWORD;

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: user,
    pass: pass,
  },
});

let mailOptions = {
  from: user,
  to: 'frobalino2001@gmail.com',
  subject: 'Termino el deploy',
  text: "Aplicación deployada.",
};

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
    process.exit(1);
  } else {
    console.log('Correo enviado: ' + info.response);
  }
});