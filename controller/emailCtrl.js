const nodemailer = require("nodemailer");

const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data, req, res) => {

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_ID, // generated ethereal user
      pass: process.env.MP, // generated ethereal password
    },
  });

  
  let info = await transporter.sendMail({
    from: '"Hey " <ab@gmail.com>', 
    to: data.to, 
    subject: data.subject, 
    text: data.text, 
    html: data.htm, 
  });

  console.log("Message sent: %s", info.messageId);
  

  
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
});

module.exports = sendEmail;
