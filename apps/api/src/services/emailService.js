import 'dotenv/config';
import nodemailer from 'nodemailer';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { getEmailLayout } from '../templates/emailLayout.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'team@trackmyscaffolding.com';

// Helper function to log email to PocketBase
async function logEmailToPocketBase(emailType, recipient, subject, status, userId = null, error = null) {
  try {
    await pb.collection('email_logs').create({
      emailType,
      recipient,
      subject,
      status,
      userId: userId || '',
      error: error || '',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error(`Failed to log email to PocketBase: ${err.message}`);
  }
}

// Helper function to send email with retry logic
async function sendEmailWithRetry(mailOptions, emailType, userId = null, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      await logEmailToPocketBase(emailType, mailOptions.to, mailOptions.subject, 'sent', userId);
      logger.info(`Email sent successfully: ${emailType} to ${mailOptions.to} (Message ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      logger.warn(`Email send attempt ${attempt}/${maxRetries} failed for ${emailType} to ${mailOptions.to}: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  await logEmailToPocketBase(emailType, mailOptions.to, mailOptions.subject, 'failed', userId, lastError.message);
  logger.error(`Failed to send email after ${maxRetries} attempts: ${emailType} to ${mailOptions.to}`);
  return { success: false, error: lastError.message };
}

// 1. Welcome Email
export async function sendWelcomeEmail({ to, firstName, setupUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Welcome to TrackMyScaffolding! We're excited to have you on board.</p>
    <p>To get started, follow these 3 simple steps:</p>
    <ol style="color: #1E3A5F;">
      <li><strong>Create your first project</strong> - Set up a project to start managing scaffolds</li>
      <li><strong>Invite your team</strong> - Add subcontractors and coordinators to collaborate</li>
      <li><strong>Submit your first request</strong> - Create and track scaffold requests digitally</li>
    </ol>
    <p>Let's get you started!</p>
  `;

  const htmlContent = getEmailLayout(content, setupUrl, 'Get Started Now', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'Your TrackMyScaffolding account is ready',
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'welcome', userId);
}

// 2. Day 3 Follow-up Email
export async function sendDay3FollowupEmail({ to, firstName, setupUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Quick check-in! We wanted to see how you're getting on with TrackMyScaffolding.</p>
    <p>Have you had a chance to:</p>
    <ul style="color: #1E3A5F;">
      <li>Create your first project?</li>
      <li>Invite your team members?</li>
      <li>Submit your first scaffold request?</li>
    </ul>
    <p>If you need any help or have questions, we're here to support you. Click the button below to continue your setup.</p>
  `;

  const htmlContent = getEmailLayout(content, setupUrl, 'Continue Setup', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: 'Quick check-in, did you get started okay?',
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'day3_followup', userId);
}

// 3. Subuser Welcome Email
export async function sendSubuserWelcomeEmail({ to, firstName, coordinatorName, coordinatorCompany, projectName, accessUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>${coordinatorName} from ${coordinatorCompany} has added you to the project <strong>${projectName}</strong> on TrackMyScaffolding.</p>
    <p>You can now:</p>
    <ul style="color: #1E3A5F;">
      <li>Submit digital scaffold requests</li>
      <li>Track request status in real-time</li>
      <li>View project updates and notifications</li>
      <li>Collaborate with your team</li>
    </ul>
    <p>Click the button below to access your project.</p>
  `;

  const htmlContent = getEmailLayout(content, accessUrl, 'Access Project', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `You've been added to ${projectName} on TrackMyScaffolding`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'subuser_welcome', userId);
}

// 4. Request Submitted Email
export async function sendRequestSubmittedEmail({ to, firstName, requestId, scaffoldNumber, subcontractorName, plantSection, installationLevel, startDate, endDate, reviewUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>A new scaffold request has been submitted and is awaiting your approval.</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> ${scaffoldNumber}</p>
      <p style="margin: 5px 0;"><strong>Plant Section:</strong> ${plantSection}</p>
      <p style="margin: 5px 0;"><strong>Subcontractor:</strong> ${subcontractorName}</p>
      <p style="margin: 5px 0;"><strong>Installation Level:</strong> ${installationLevel}</p>
      <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate}</p>
      <p style="margin: 5px 0;"><strong>End Date:</strong> ${endDate}</p>
    </div>
    <p>Please review the request and approve or request changes.</p>
  `;

  const htmlContent = getEmailLayout(content, reviewUrl, 'Review Request', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `New scaffold request submitted, ${scaffoldNumber} / ${plantSection}`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'request_submitted', userId);
}

// 5. Request Approved Email
export async function sendRequestApprovedEmail({ to, firstName, requestId, scaffoldNumber, plantSection, coordinatorName, approvedDate, approvedTime, detailUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Great news! Your scaffold request has been approved.</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> ${scaffoldNumber}</p>
      <p style="margin: 5px 0;"><strong>Plant Section:</strong> ${plantSection}</p>
      <p style="margin: 5px 0;"><strong>Approved By:</strong> ${coordinatorName}</p>
      <p style="margin: 5px 0;"><strong>Approved Date:</strong> ${approvedDate} at ${approvedTime}</p>
    </div>
    <p>You can now proceed with the installation. Click below to view the full details.</p>
  `;

  const htmlContent = getEmailLayout(content, detailUrl, 'View Details', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Scaffold request approved, ${scaffoldNumber} / ${plantSection}`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'request_approved', userId);
}

// 6. Request Rejected Email
export async function sendRequestRejectedEmail({ to, firstName, requestId, scaffoldNumber, plantSection, coordinatorName, coordinatorComment, viewUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Your scaffold request has not been approved at this time.</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> ${scaffoldNumber}</p>
      <p style="margin: 5px 0;"><strong>Plant Section:</strong> ${plantSection}</p>
      <p style="margin: 5px 0;"><strong>Reviewed By:</strong> ${coordinatorName}</p>
      <p style="margin: 5px 0; color: #dc2626;"><strong>Reason:</strong> ${coordinatorComment}</p>
    </div>
    <p>Please review the feedback and feel free to resubmit with any necessary adjustments.</p>
  `;

  const htmlContent = getEmailLayout(content, viewUrl, 'View Request', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Scaffold request not approved, ${scaffoldNumber} / ${plantSection}`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'request_rejected', userId);
}

// 7. Changes Requested Email
export async function sendChangesRequestedEmail({ to, firstName, requestId, scaffoldNumber, plantSection, coordinatorName, coordinatorComment, editUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Changes have been requested for your scaffold request.</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Request Number:</strong> ${scaffoldNumber}</p>
      <p style="margin: 5px 0;"><strong>Plant Section:</strong> ${plantSection}</p>
      <p style="margin: 5px 0;"><strong>Requested By:</strong> ${coordinatorName}</p>
      <p style="margin: 5px 0; color: #f59e0b;"><strong>Changes Required:</strong> ${coordinatorComment}</p>
    </div>
    <p>Please update your request and resubmit for approval.</p>
  `;

  const htmlContent = getEmailLayout(content, editUrl, 'Edit Request', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Changes requested, ${scaffoldNumber} / ${plantSection}`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'changes_requested', userId);
}

// 8. Pending Reminder Email
export async function sendPendingReminderEmail({ to, firstName, pendingCount, reviewUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>You have <strong>${pendingCount}</strong> scaffold request(s) awaiting your approval.</p>
    <p>These requests are pending and need your attention to keep projects on track.</p>
    <p>Click the button below to review and approve the pending requests.</p>
  `;

  const htmlContent = getEmailLayout(content, reviewUrl, 'Review Pending Requests', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Reminder: ${pendingCount} scaffold request(s) awaiting approval`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'pending_reminder', userId);
}

// 9. Monthly Report Ready Email
export async function sendMonthlyReportReadyEmail({ to, firstName, monthYear, totalRequests, approved, rejected, pending, activeScaffolds, totalHours, reportUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Your monthly scaffold report for <strong>${monthYear}</strong> is ready!</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Total Requests:</strong> ${totalRequests}</p>
      <p style="margin: 5px 0;"><strong>Approved:</strong> ${approved}</p>
      <p style="margin: 5px 0;"><strong>Rejected:</strong> ${rejected}</p>
      <p style="margin: 5px 0;"><strong>Pending:</strong> ${pending}</p>
      <p style="margin: 5px 0;"><strong>Active Scaffolds:</strong> ${activeScaffolds}</p>
      <p style="margin: 5px 0;"><strong>Total Worker Hours:</strong> ${totalHours}</p>
    </div>
    <p>Click below to view the full report with detailed analytics.</p>
  `;

  const htmlContent = getEmailLayout(content, reportUrl, 'View Full Report', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Your ${monthYear} scaffold report is ready`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'monthly_report', userId);
}

// 10. Free Plan Limit Email
export async function sendFreePlanLimitEmail({ to, firstName, pricingUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>You've reached the limit of your Free plan (20 scaffold requests).</p>
    <p>To continue submitting requests and unlock advanced features, please upgrade to a paid plan.</p>
    <p>Our plans include:</p>
    <ul style="color: #1E3A5F;">
      <li><strong>Starter:</strong> Up to 10 active scaffolds, basic tracking</li>
      <li><strong>Professional:</strong> Unlimited scaffolds, AI assistant, advanced reports</li>
      <li><strong>Enterprise:</strong> Everything plus dedicated support and custom integrations</li>
    </ul>
    <p>Click below to view our pricing and upgrade your account.</p>
  `;

  const htmlContent = getEmailLayout(content, pricingUrl, 'View Pricing', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: "You've reached your Free plan limit",
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'free_plan_limit', userId);
}

// 11. Payment Confirmation Email
export async function sendPaymentConfirmationEmail({ to, firstName, planName, amount, billingPeriod, nextBillingDate, accountUrl, userId = null }) {
  const content = `
    <p>Hi ${firstName},</p>
    <p>Thank you for your payment! Your subscription has been confirmed.</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 5px 0;"><strong>Plan:</strong> ${planName}</p>
      <p style="margin: 5px 0;"><strong>Amount:</strong> €${amount}</p>
      <p style="margin: 5px 0;"><strong>Billing Period:</strong> ${billingPeriod}</p>
      <p style="margin: 5px 0;"><strong>Next Billing Date:</strong> ${nextBillingDate}</p>
    </div>
    <p>You now have full access to all features. Click below to manage your account and subscription.</p>
  `;

  const htmlContent = getEmailLayout(content, accountUrl, 'Manage Account', '');

  const mailOptions = {
    from: EMAIL_FROM,
    to,
    subject: `Payment confirmed, ${planName} subscription`,
    html: htmlContent,
  };

  return sendEmailWithRetry(mailOptions, 'payment_confirmation', userId);
}

export default {
  sendWelcomeEmail,
  sendDay3FollowupEmail,
  sendSubuserWelcomeEmail,
  sendRequestSubmittedEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
  sendChangesRequestedEmail,
  sendPendingReminderEmail,
  sendMonthlyReportReadyEmail,
  sendFreePlanLimitEmail,
  sendPaymentConfirmationEmail,
};
