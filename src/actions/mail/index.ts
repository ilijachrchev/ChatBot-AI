'use server'

import { CampaignStatus } from '@/generated/prisma'
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import nodemailer from 'nodemailer'

export const onGetAllCustomers = async (id: string) => {
  try {
    const customers = await client.user.findUnique({
      where: {
        clerkId: id,
      },
      select: {
        subscription: {
          select: {
            credits: true,
            plan: true,
          },
        },
        domains: {
          select: {
            customer: {
              select: {
                id: true,
                email: true,
                Domain: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (customers) {
      return customers
    }
  } catch (error) {}
}

export const onGetAllCampaigns = async (id: string) => {
  try {
    const campaigns = await client.user.findUnique({
      where: {
        clerkId: id,
      },
      select: {
        campaign: {
          select: {
            name: true,
            id: true,
            customers: true,
            createdAt: true,
            status: true,        
            scheduledAt: true,    
            sentAt: true,         
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (campaigns) {
      return campaigns
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateMarketingCampaign = async (name: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    const campaign = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        campaign: {
          create: {
            name,
          },
        },
      },
    })

    if (campaign) {
      return { status: 200, message: 'You campaign was created' }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onSaveEmailTemplate = async (
  template: string,
  campainId: string
) => {
  try {
    const newTemplate = await client.campaign.update({
      where: {
        id: campainId,
      },
      data: {
        template,
      },
    })

    return { status: 200, message: 'Email template created' }
  } catch (error) {
    console.log(error)
  }
}

export const onAddCustomersToEmail = async (
  customers: string[],
  id: string
) => {
  try {
    const campaign = await client.campaign.findUnique({
      where: { id },
      select: { customers: true },
    })

    const existing = campaign?.customers ?? []

    const updatedCustomers = Array.from(
      new Set([...existing, ...customers])
    )

    const customerAdd = await client.campaign.update({
      where: {
        id,
      },
      data: {
        customers: updatedCustomers,
      },
    })

    if (customerAdd) {
      return { status: 200, message: 'Customer added to campaign' }
    }
  } catch (error) {}
}

export const onRemoveCustomerFromCapaign = async (
  campaignId: string,
  email: string
) => {
  try {
    const campaign = await client.campaign.findUnique({
      where: { id: campaignId },
      select: { customers: true }
    })

    if (!campaign) {
      return { status: 404, message: 'Campaign not found!' }
    }

    const updatedCustomers = campaign.customers.filter(
      (e) => e !== email
    )

    await client.campaign.update({
      where: { id: campaignId },
      data: { customers: updatedCustomers },
    })

    return { status: 200, message: 'Customer removed from campaign!' }
  } catch (error) {}
}

export const onBulkMailer = async (email: string[], campaignId: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    const template = await client.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        name: true,
        template: true,
      },
    })

    if (template && template.template) {
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
        to: email,
        subject: template.name,
        text: JSON.parse(template.template),
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error)
        } else {
          console.log('Email sent: ' + info.response)
        }
      })

      const creditsUsed = await client.user.update({
        where: {
          clerkId: user.id,
        },
        data: {
          subscription: {
            update: {
              credits: { decrement: email.length },
            },
          },
        },
      })
      if (creditsUsed) {
        return { status: 200, message: 'Campaign emails sent' }
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetAllCustomerResponses = async (id: string) => {
  try {
    const user = await currentUser()
    if (!user) return null
    const answers = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        domains: {
          select: {
            customer: {
              select: {
                questions: {
                  where: {
                    customerId: id,
                    answered: {
                      not: null,
                    },
                  },
                  select: {
                    question: true,
                    answered: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (answers) {
      return answers.domains
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetEmailTemplate = async (id: string) => {
  try {
    const template = await client.campaign.findUnique({
      where: {
        id,
      },
      select: {
        template: true,
      },
    });

    if (template) {
      return template.template;
    }
  } catch (error) {
    console.log(error);
  }
};


export const onScheduleCampaign = async (
  campaignId: string,
  scheduledAt: Date | null
) => {
  try {
    const user = await currentUser()
    if (!user) {
      console.error('❌ No user found')
      return { status: 400, message: 'User not found' }
    }

    console.log('✅ User found:', user.id)
    console.log('📧 Campaign ID:', campaignId)
    console.log('📅 Scheduled At:', scheduledAt)

    const existingCampaign = await client.campaign.findFirst({
      where: {
        id: campaignId,
        User: {
          clerkId: user.id,
        },
      },
      include: {
        User: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!existingCampaign) {
      console.error('❌ Campaign not found or does not belong to user')
      return { status: 404, message: 'Campaign not found' }
    }

    console.log('✅ Campaign found, belongs to user')

    const status: CampaignStatus = scheduledAt ? 'SCHEDULED' : 'SENDING'
    
    console.log('🎯 Setting status to:', status)

    const campaign = await client.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        scheduledAt: scheduledAt,
        status: status,
        sentAt: null,
        updatedAt: new Date(),
      },
    })

    console.log('✅ Campaign updated:', campaign)

    if (!scheduledAt) {
      console.log('📨 Sending emails immediately...')
      
      const campaignDetails = await client.campaign.findUnique({
        where: { id: campaignId },
        select: {
          customers: true,
          template: true,
          name: true,
        },
      })

      if (campaignDetails && campaignDetails.customers.length > 0) {
        const result = await onBulkMailer(campaignDetails.customers, campaignId)
        
        if (result?.status === 200) {
          await client.campaign.update({
            where: { id: campaignId },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
          })

          return {
            status: 200,
            message: 'Campaign emails sent successfully!',
          }
        } else {
          await client.campaign.update({
            where: { id: campaignId },
            data: { status: 'FAILED' },
          })

          return {
            status: 500,
            message: 'Failed to send campaign emails',
          }
        }
      } else {
        return {
          status: 400,
          message: 'No customers or template found in campaign',
        }
      }
    }

    return {
      status: 200,
      message: `Campaign scheduled for ${scheduledAt.toLocaleString()}`,
    }
  } catch (error: any) {
    console.error('❌ Error scheduling campaign:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
    
    return {
      status: 500,
      message: error.message || 'Failed to schedule campaign',
    }
  }
}


export const onGetScheduledCampaigns = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const scheduled = await client.campaign.findMany({
      where: {
        userId: user.id,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(), 
        },
      },
      select: {
        id: true,
        name: true,
        scheduledAt: true,
        customers: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    return scheduled
  } catch (error) {
    console.error('Error fetching scheduled campaigns:', error)
    return null
  }
}

export const onCancelScheduledCampaign = async (campaignId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 400, message: 'User not found' }

    const campaign = await client.campaign.update({
      where: {
        id: campaignId,
        userId: user.id,
      },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    })

    if (campaign) {
      return {
        status: 200,
        message: 'Campaign cancelled successfully',
      }
    }

    return {
      status: 404,
      message: 'Campaign not found',
    }
  } catch (error) {
    console.error('Error cancelling campaign:', error)
    return {
      status: 500,
      message: 'Failed to cancel campaign',
    }
  }
}

export const onUpdateCampaignStatus = async (
  campaignId: string,
  status: CampaignStatus,
  sentAt?: Date
) => {
  try {
    const campaign = await client.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        status,
        sentAt: sentAt || (status === 'SENT' ? new Date() : undefined),
        updatedAt: new Date(),
      },
    })

    return campaign ? { status: 200 } : { status: 404 }
  } catch (error) {
    console.error('Error updating campaign status:', error)
    return { status: 500 }
  }
}