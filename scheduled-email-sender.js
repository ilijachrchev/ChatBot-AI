require('dotenv').config()
const { PrismaClient } = require('./src/generated/prisma')
const nodemailer = require('nodemailer')

const prisma = new PrismaClient()

async function sendScheduledEmails() {
  console.log('🔍 Checking for scheduled campaigns...', new Date().toLocaleString())
  
  try {
    const now = new Date()
    const campaignsToSend = await prisma.campaign.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now, 
        },
      },
      include: {
        User: {
          select: {
            id: true,
            clerkId: true,
            subscription: {
              select: {
                credits: true,
              },
            },
          },
        },
      },
    })

    console.log(`📧 Found ${campaignsToSend.length} campaigns to send`)

    for (const campaign of campaignsToSend) {
      console.log(`\n🚀 Processing campaign: ${campaign.name}`)
      console.log(`   Campaign ID: ${campaign.id}`)
      console.log(`   Scheduled for: ${campaign.scheduledAt}`)
      console.log(`   Recipients: ${campaign.customers.length}`)
      
      try {
        const creditsNeeded = campaign.customers.length
        const currentCredits = campaign.User?.subscription?.credits || 0

        if (currentCredits < creditsNeeded) {
          console.log(`❌ Not enough credits. Need: ${creditsNeeded}, Have: ${currentCredits}`)
          
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: 'FAILED' },
          })
          
          continue
        }

        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'SENDING' },
        })

        console.log(`   Status updated to SENDING`)

        if (campaign.template && campaign.customers.length > 0) {
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
              user: process.env.NODE_MAILER_EMAIL,
              pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
            },
          })

          const mailOptions = {
            to: campaign.customers,
            subject: campaign.name,
            text: JSON.parse(campaign.template),
          }

          console.log(`   Sending emails to: ${campaign.customers.join(', ')}`)

          const info = await transporter.sendMail(mailOptions)
          console.log(`✅ Emails sent! Message ID: ${info.messageId}`)

          await prisma.campaign.update({
            where: { id: campaign.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          })

          console.log(`   Status updated to SENT`)

          if (campaign.User?.subscription) {
            await prisma.billings.update({
              where: { userId: campaign.User.id },
              data: {
                credits: {
                  decrement: creditsNeeded,
                },
              },
            })

            console.log(`   Credits deducted: ${creditsNeeded}`)
          }

          console.log(`✅ Campaign "${campaign.name}" sent successfully!`)
        } else {
          console.log(`❌ No template or customers found`)
          
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: 'FAILED' },
          })
        }
      } catch (error) {
        console.error(`❌ Failed to send campaign ${campaign.name}:`, error.message)
        
        await prisma.campaign.update({
          where: { id: campaign.id },
          data: { status: 'FAILED' },
        })
      }
    }

    if (campaignsToSend.length === 0) {
      console.log('   No campaigns ready to send')
    }

  } catch (error) {
    console.error('❌ Error in scheduled email sender:', error)
  }
}

async function main() {
  console.log('⏰ Scheduled Email Sender Started!')
  console.log('🔄 Checking every minute for campaigns to send...\n')

  await sendScheduledEmails()

  setInterval(async () => {
    await sendScheduledEmails()
  }, 60 * 1000) 
}

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down scheduler...')
  await prisma.$disconnect()
  process.exit(0)
})

main()