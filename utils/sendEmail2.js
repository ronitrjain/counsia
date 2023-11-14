import * as nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';


import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();

}

const PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL = process.env.EMAIL;


const transportOptions = {
    host: 'smtp.office365.com',
    port: '587',
    auth: { user: EMAIL, pass: PASSWORD },
    secureConnection: true,
    tls: { ciphers: 'SSLv3' }
};

var mailTransport = nodemailer.createTransport(transportOptions);






async function sendEmail(email, subject, file_name, replacements) {

    try {

        const __dirname = path.resolve();
        const filePath = path.join(__dirname, './public/assets/email/' + file_name);
        const source = fs.readFileSync(filePath, 'utf-8').toString();
        const template = handlebars.compile(source);

        const htmlToSend = template(replacements);


        let info = await mailTransport.sendMail({
            from: EMAIL,
            to: email,
            subject: subject,
            html: htmlToSend
        }
        );

        console.log("Message sent: %s", info.messageId);

    } catch (e) {
        console.log("Error sending email")
        console.log(e);
    }

}



export default sendEmail;
