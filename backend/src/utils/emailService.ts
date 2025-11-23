/**
 * Email Service using Resend
 *
 * This module handles all email sending functionality for the application.
 * It uses Resend API to send transactional emails with professional HTML templates.
 *
 * Security features:
 * - Validates environment variables on initialization
 * - Includes timestamp and security information in emails
 * - Uses verified sender addresses only
 * - Comprehensive error logging
 */

import { Resend } from 'resend';

// Environment variable validation
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Hayde <onboarding@resend.dev>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Initialize Resend with API key
let resend: Resend | null = null;

if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
} else {
  console.warn('⚠️  RESEND_API_KEY not configured. Email functionality will be disabled.');
}

/**
 * Sends a password reset email with a secure reset link
 *
 * @param email - Recipient email address
 * @param resetToken - Secure reset token (unhashed)
 * @param userName - User's name or email for personalization
 * @returns Promise<void>
 *
 * Security notes:
 * - Token is included in URL as a one-time use parameter
 * - Email includes timestamp and expiration information
 * - Link expires after 1 hour (configured in backend)
 */
export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string,
  userName: string = 'User'
): Promise<void> => {
  // Validate required configuration
  if (!resend || !RESEND_API_KEY) {
    console.error('❌ Resend not configured. Skipping email send.');
    console.log(`📧 [DEV MODE] Password reset link: ${FRONTEND_URL}/reset-password/${resetToken}`);
    return;
  }

  const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });

  // Professional HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - Hayde</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 0 0 20px;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .link-box {
          background-color: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 15px;
          margin: 20px 0;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
          color: #666;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #e0e0e0;
        }
        .security-info {
          background-color: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .security-info strong {
          color: #856404;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>

        <div class="content">
          <p>Hello,</p>

          <p>We received a request to reset the password for your Hayde account associated with this email address.</p>

          <p>Click the button below to reset your password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p style="font-size: 14px; color: #666;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <div class="link-box">${resetUrl}</div>

          <div class="security-info">
            <strong>⚠️ Security Information:</strong>
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li><strong>This link expires in 1 hour</strong> for your security</li>
              <li>This is a one-time use link</li>
              <li>Request made at: ${currentTime} (Israel Time)</li>
            </ul>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Didn't request this?</strong><br>
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            <strong>Hayde</strong> - Wedding Planning Made Easy<br>
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version for email clients that don't support HTML
  const textContent = `
Password Reset Request

Hello,

We received a request to reset the password for your Hayde account.

Click this link to reset your password:
${resetUrl}

Security Information:
- This link expires in 1 hour
- This is a one-time use link
- Request made at: ${currentTime} (Israel Time)

If you didn't request a password reset, you can safely ignore this email.

---
Hayde - Wedding Planning Made Easy
This is an automated email. Please do not reply.
  `.trim();

  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - Hayde',
      text: textContent,
      html: htmlContent,
    });
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error: any) {
    console.error('❌ Failed to send password reset email:', error);
    if (error.message) {
      console.error('Resend error:', error.message);
    }
    // Don't throw error - we don't want to expose email sending failures to users
    // This prevents user enumeration attacks
  }
};

/**
 * Sends a confirmation email after successful password change
 *
 * @param email - Recipient email address
 * @param userName - User's name or email for personalization
 * @returns Promise<void>
 *
 * Security notes:
 * - Alerts user of password change for account security
 * - Includes timestamp of the change
 * - Provides guidance if change was unauthorized
 */
export const sendPasswordChangedNotification = async (
  email: string,
  userName: string = 'User'
): Promise<void> => {
  // Validate required configuration
  if (!resend || !RESEND_API_KEY) {
    console.error('❌ Resend not configured. Skipping email send.');
    console.log(`📧 [DEV MODE] Would send password changed notification to ${email}`);
    return;
  }

  const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' });
  const loginUrl = `${FRONTEND_URL}/login`;

  // Professional HTML email template
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Changed Successfully - Hayde</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .content p {
          margin: 0 0 20px;
          font-size: 16px;
        }
        .success-box {
          background-color: #d1fae5;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .warning-box {
          background-color: #fee;
          border: 1px solid #dc2626;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          font-size: 14px;
        }
        .warning-box strong {
          color: #dc2626;
        }
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          font-size: 14px;
          color: #666;
          border-top: 1px solid #e0e0e0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Changed Successfully</h1>
        </div>

        <div class="content">
          <p>Hello,</p>

          <div class="success-box">
            <strong>Your password has been changed successfully.</strong>
          </div>

          <p>The password for your Hayde account was recently changed.</p>

          <p><strong>Change made at:</strong> ${currentTime} (Israel Time)</p>

          <p>You can now log in to your account using your new password:</p>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Log In to Hayde</a>
          </div>

          <div class="warning-box">
            <strong>⚠️ Didn't make this change?</strong><br><br>
            If you didn't change your password, your account may have been compromised. Please contact support immediately and consider:
            <ul style="margin: 10px 0 0; padding-left: 20px;">
              <li>Resetting your password again</li>
              <li>Checking your account activity</li>
              <li>Enabling additional security measures</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 0;">
            <strong>Hayde</strong> - Wedding Planning Made Easy<br>
            This is an automated email. Please do not reply.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Plain text version
  const textContent = `
Password Changed Successfully

Hello,

Your password has been changed successfully.

The password for your Hayde account was recently changed.

Change made at: ${currentTime} (Israel Time)

You can now log in to your account using your new password:
${loginUrl}

⚠️ Didn't make this change?
If you didn't change your password, your account may have been compromised.
Please contact support immediately.

---
Hayde - Wedding Planning Made Easy
This is an automated email. Please do not reply.
  `.trim();

  try {
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Password Changed Successfully - Hayde',
      text: textContent,
      html: htmlContent,
    });
    console.log(`✅ Password changed notification sent to ${email}`);
  } catch (error: any) {
    console.error('❌ Failed to send password changed notification:', error);
    if (error.message) {
      console.error('Resend error:', error.message);
    }
    // Don't throw error - notification failure shouldn't block password reset
  }
};
