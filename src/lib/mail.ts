import nodemailer from "nodemailer";

export async function sendEmailWithAttachment(args: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachmentName: string;
  attachmentContent: Buffer;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: args.to,
    subject: args.subject,
    text: args.text,
    html: args.html,
    attachments: [
      {
        filename: args.attachmentName,
        content: args.attachmentContent,
        contentType: "application/pdf"
      }
    ]
  });
}