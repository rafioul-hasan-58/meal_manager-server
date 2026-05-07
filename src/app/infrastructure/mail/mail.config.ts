import nodemailer from "nodemailer";
import config from "../../../config";


export const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: false,
    auth: {
        user: config.smtp.email,
        pass: config.smtp.pass,
    },
} as any);