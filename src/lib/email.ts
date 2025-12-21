import { Resend } from 'resend'
import { PRICING_CONFIG, type PlanType } from './pricing-config'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendSubscriptionReceipt({
  email,
  name,
  amount,
  plan,
  paymentIntentId,
  date = new Date(),
}: {
  email: string
  name: string
  amount: number
  plan: PlanType
  paymentIntentId: string
  date?: Date
}) {
  const planDetails = PRICING_CONFIG[plan]

  try {
    const { data, error } = await resend.emails.send({
      from: 'SendWise AI <billing@sendwiseai.com>', 
      to: [email],
      subject: `Payment Confirmation - ${planDetails.displayName} Plan`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Receipt</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful! 🎉</h1>
            </div>
            
            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px; margin-top: 0;">Hi ${name},</p>
              
              <p style="font-size: 16px;">Thank you for upgrading to <strong>${planDetails.displayName}</strong>! Your payment has been processed successfully.</p>
              
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h2 style="margin-top: 0; font-size: 18px; color: #1f2937;">Payment Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Plan:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${planDetails.displayName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Amount:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">$${(amount / 100).toFixed(2)} USD</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600;">${date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #6b7280;">Receipt ID:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: monospace; font-size: 12px;">${paymentIntentId}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 25px 0;">
                <h3 style="margin-top: 0; font-size: 16px; color: #1e40af;">What's Included:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  ${typeof planDetails.features.conversations === 'number' 
                    ? `<li>${planDetails.features.conversations} conversations per month</li>` 
                    : '<li>Unlimited conversations</li>'}
                  <li>${planDetails.features.domains} domain${planDetails.features.domains > 1 ? 's' : ''}</li>
                  ${typeof planDetails.features.emailCampaigns === 'number'
                    ? `<li>${planDetails.features.emailCampaigns} email campaigns</li>`
                    : '<li>Unlimited email campaigns</li>'}
                  ${planDetails.features.chatbotCustomization ? '<li>Full chatbot customization</li>' : ''}
                  ${planDetails.features.prioritySupport ? '<li>Priority support</li>' : ''}
                  ${planDetails.features.apiAccess ? '<li>API access</li>' : ''}
                </ul>
              </div>
              
              <p style="font-size: 16px;">Your subscription will automatically renew on <strong>${new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://sendwiseai.com/account/billing" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">View Billing Details</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
              
              <p style="font-size: 14px; color: #6b7280; margin-bottom: 0;">Questions? Contact us at <a href="mailto:support@sendwiseai.com" style="color: #3b82f6; text-decoration: none;">support@sendwiseai.com</a></p>
              
              <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">This is an automated receipt from SendWise AI. Please do not reply to this email.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending receipt email:', error)
      return { success: false, error }
    }

    console.log('Receipt email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending receipt email:', error)
    return { success: false, error }
  }
}