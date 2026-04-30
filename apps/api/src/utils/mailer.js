import axios from 'axios';
import logger from './logger.js';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = 'TrackMyScaffolding <noreply@trackmyscaffolding.com>';

export async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    logger.error('RESEND_API_KEY is not set — email not sent');
    return;
  }

  const response = await axios.post(
    'https://api.resend.com/emails',
    { from: FROM_ADDRESS, to, subject, html },
    {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  logger.info(`Email sent to ${to} — Resend ID: ${response.data.id}`);
  return response.data;
}

export function buildVerificationEmail({ verifyUrl, full_name }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; }
    .logo { font-size: 20px; font-weight: bold; color: #111; margin-bottom: 32px; }
    h1 { font-size: 22px; color: #111; margin-bottom: 16px; }
    p { color: #555; line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: #111; color: #fff; text-decoration: none;
           padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 24px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">TrackMyScaffolding</div>
    <h1>Verify your email address</h1>
    <p>Hi ${full_name},</p>
    <p>Thanks for signing up! Please verify your email address to activate your account.</p>
    <a href="${verifyUrl}" class="btn">Verify Email</a>
    <p>Or copy this link:<br><small>${verifyUrl}</small></p>
    <div class="footer">
      This link expires in 24 hours. If you didn't create an account, you can ignore this email.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function buildInviteEmail({ inviteUrl, projectName, coordinatorName }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 8px; padding: 40px; }
    .logo { font-size: 20px; font-weight: bold; color: #111; margin-bottom: 32px; }
    h1 { font-size: 22px; color: #111; margin-bottom: 16px; }
    p { color: #555; line-height: 1.6; margin-bottom: 16px; }
    .btn { display: inline-block; background: #111; color: #fff; text-decoration: none;
           padding: 12px 28px; border-radius: 6px; font-weight: bold; margin: 24px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">TrackMyScaffolding</div>
    <h1>You've been invited to join a project</h1>
    <p><strong>${coordinatorName}</strong> has invited you to join <strong>${projectName}</strong> on TrackMyScaffolding.</p>
    <p>Click the button below to set up your account and get started.</p>
    <a href="${inviteUrl}" class="btn">Accept Invitation</a>
    <p>Or copy this link:<br><small>${inviteUrl}</small></p>
    <div class="footer">
      This invite expires in 30 days. If you didn't expect this email, you can ignore it.
    </div>
  </div>
</body>
</html>
  `.trim();
}
