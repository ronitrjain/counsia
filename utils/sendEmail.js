
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();

}

import nodemailer from 'nodemailer';

const PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL = process.env.EMAIL;

const gmail_user = process.env.GMAIL_EMAIL
const gmail_password = process.env.GMAIL_PASSWORD

const transportOptions = {
    host: 'smtp.office365.com',
    port: '587',
    auth: { user: EMAIL, pass: PASSWORD },
    secureConnection: true,
    tls: { ciphers: 'SSLv3' }
};





var mailTransport = nodemailer.createTransport(transportOptions);










async function sendEmail(to, subject, text) {
    

try{
        await mailTransport.sendMail({
            from: EMAIL,
            to: to,
            subject: subject,
            text: text
        }
        );

}catch(e){
    console.log("OUTLOOK:" + e);

}






    
}


export default sendEmail;

