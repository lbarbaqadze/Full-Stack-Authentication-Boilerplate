import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    })

    const mailOptions = {
        from: "Auth <infovoyager2021@gmail.com>",
        to: options.email, 
        subject: options.subject, 
        text: options.message 
    }

    await transporter.sendMail(mailOptions)
}

export default sendEmail

