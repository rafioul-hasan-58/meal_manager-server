import config from "../../../config";
import { transporter } from "./mail.config";
import { AuthTemplates } from "./Templates/AuthTemplates";

export const mailService = {
    sendEmail: async (to: string, otp: string, subject: string) => {
        const formattedDate = new Intl.DateTimeFormat("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date());

        let html: string;
        html = AuthTemplates.otp(otp, formattedDate);

        const res = await transporter.sendMail({
            from: `${config.smtp.name} <${config.smtp.email_from}>`,
            to,
            subject,
            html,
        });
        return res
    },

}

