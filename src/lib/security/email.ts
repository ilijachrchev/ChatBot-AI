import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
})

export async function sendOTPEmail(
  toEmail: string,
  code: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const mailOptions = {
      from: `"SendWise AI Security" <${process.env.NODE_MAILER_EMAIL}>`,
      to: toEmail,
      subject: 'Verify Your Login - Security Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Login</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%); padding: 40px 40px 60px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                        🔐 Security Verification
                      </h1>
                    </td>
                  </tr>
                  
                  <!-- Body -->
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 24px; color: #1e293b; font-size: 16px; line-height: 1.6;">
                        Hi <strong>${userName}</strong>,
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #475569; font-size: 16px; line-height: 1.6;">
                        We detected a login attempt from a new device or location. To ensure your account security, please verify this login using the code below:
                      </p>
                      
                      <!-- OTP Code Box -->
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td align="center">
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border: 2px solid #3B82F6; border-radius: 12px; padding: 24px; display: inline-block;">
                              <p style="margin: 0 0 8px; color: #64748b; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">
                                Your verification code
                              </p>
                              <p style="margin: 0; color: #1e293b; font-size: 42px; font-weight: 700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                ${code}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6;">
                        <strong>⏱️ This code will expire in 10 minutes.</strong>
                      </p>
                      
                      <p style="margin: 0 0 24px; color: #475569; font-size: 14px; line-height: 1.6;">
                        If you didn't attempt to log in, please ignore this email and ensure your password is secure.
                      </p>
                      
                      <!-- Security Tips -->
                      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 8px;">
                        <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                          🛡️ Security Reminder
                        </p>
                        <p style="margin: 8px 0 0; color: #7f1d1d; font-size: 13px; line-height: 1.5;">
                          SendWise AI will never ask for your password or verification code via email, phone, or any other method.
                        </p>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 8px; color: #64748b; font-size: 13px;">
                        This email was sent by <strong>SendWise AI</strong>
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                        If you have questions, contact us at support@sendwiseai.com
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hi ${userName},

We detected a login attempt from a new device or location. To ensure your account security, please verify this login using the code below:

Your verification code: ${code}

This code will expire in 10 minutes.

If you didn't attempt to log in, please ignore this email and ensure your password is secure.

Security Reminder: SendWise AI will never ask for your password or verification code via email, phone, or any other method.

---
This email was sent by SendWise AI
If you have questions, contact us at support@sendwiseai.com
      `,
    }

    await transporter.sendMail(mailOptions)
    
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    }
  }
}