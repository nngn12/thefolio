const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
}

async function sendOTPEmail(toEmail, toName, otp) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"TheFolio" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your TheFolio Verification Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;
                  background:#fafafa;border-radius:12px;border:1px solid #e5e5e5;">
        <h2 style="color:#1a1a1a;margin-bottom:8px;">Verify your email</h2>
        <p style="color:#555;margin-bottom:24px;">
          Hi <strong>${toName}</strong>, welcome to TheFolio!
          Use the code below to complete your registration.
        </p>
        <div style="background:#1a1a1a;color:#fff;font-size:2rem;font-weight:700;
                    letter-spacing:12px;text-align:center;padding:20px 0;border-radius:8px;">
          ${otp}
        </div>
        <p style="color:#888;margin-top:24px;font-size:0.85rem;">
          This code expires in <strong>10 minutes</strong>.
          If you did not sign up, ignore this email.
        </p>
      </div>
    `,
  });
}

async function sendReplyEmail(toEmail, toName, originalMessage, replyText) {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"TheFolio Admin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'TheFolio — Reply to your message',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;
                  background:#fafafa;border-radius:12px;border:1px solid #e5e5e5;">
        <h2 style="color:#1a1a1a;margin-bottom:4px;">You have a reply from TheFolio</h2>
        <p style="color:#888;font-size:0.85rem;margin-bottom:24px;">Hi ${toName},</p>
        <div style="background:#f0f0f0;border-left:4px solid #ccc;padding:12px 16px;
                    border-radius:4px;margin-bottom:20px;color:#555;font-style:italic;">
          Your message: "${originalMessage}"
        </div>
        <div style="background:#1a1a1a;color:#fff;padding:16px 20px;
                    border-radius:8px;line-height:1.6;">
          ${replyText}
        </div>
        <p style="color:#888;margin-top:24px;font-size:0.85rem;">
          You can also view this reply in your dashboard on TheFolio.
        </p>
      </div>
    `,
  });
}

module.exports = { sendOTPEmail, sendReplyEmail };
