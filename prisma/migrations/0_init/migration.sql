-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtemsopm
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Plans" AS ENUM ('STANDARD', 'PRO', 'ULTIMATE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'assistant');

-- CreateEnum
CREATE TYPE "KnowledgeBaseFileStatus" AS ENUM ('READY', 'PROCESSING', 'DISABLED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "fullname" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastNameChange" TIMESTAMP(3),
    "avatar" TEXT,
    "stripeId" TEXT,
    "stripeCustomerId" TEXT,
    "keepMeLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "onboardingDismissed" BOOLEAN NOT NULL DEFAULT false,
    "blockedUntil" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "verificationToken" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verificationMethod" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "userId" UUID NOT NULL,
    "campaignId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "realtimeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "liveNotificationsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "personaLastChangedAt" TIMESTAMP(3),

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatBot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "welcomeMessage" TEXT,
    "icon" TEXT,
    "background" TEXT,
    "textColor" TEXT,
    "helpdesk" BOOLEAN NOT NULL DEFAULT false,
    "domainId" UUID,
    "backgroundColor" TEXT DEFAULT '#3B82F6',
    "persona" TEXT NOT NULL DEFAULT 'SendWise-Agent',
    "customPrompt" TEXT,
    "chatbotTitle" TEXT DEFAULT 'SendWise-AI',
    "chatbotSubtitle" TEXT,
    "userBubbleColor" TEXT DEFAULT '#3B82F6',
    "botBubbleColor" TEXT DEFAULT '#F1F5F9',
    "userTextColor" TEXT DEFAULT '#FFFFFF',
    "botTextColor" TEXT DEFAULT '#1E293B',
    "buttonStyle" TEXT DEFAULT 'ROUNDED',
    "bubbleStyle" TEXT DEFAULT 'ROUNDED',
    "showAvatars" BOOLEAN NOT NULL DEFAULT true,
    "widgetSize" TEXT DEFAULT 'MEDIUM',
    "widgetStyle" TEXT DEFAULT 'SOLID',
    "removeBranding" BOOLEAN NOT NULL DEFAULT false,
    "chatPosition" TEXT DEFAULT 'BOTTOM_RIGHT',
    "presenceMode" TEXT NOT NULL DEFAULT 'AUTO',
    "offlineBehavior" TEXT NOT NULL DEFAULT 'SHOW_HOURS_AND_EMAIL',
    "offlineCustomMessage" TEXT,
    "showPresenceBadge" BOOLEAN NOT NULL DEFAULT true,
    "teaserEnabled" BOOLEAN NOT NULL DEFAULT false,
    "teaserMessage" TEXT DEFAULT 'Have a question? 💬',
    "teaserDelay" INTEGER NOT NULL DEFAULT 3,

    CONSTRAINT "ChatBot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Billings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "plan" "Plans" NOT NULL DEFAULT 'STANDARD',
    "credits" INTEGER NOT NULL DEFAULT 10,
    "userId" UUID,
    "stripeSubscriptionId" TEXT,
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "stripePriceId" TEXT,
    "stripeCustomerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Billings_pkey" PRIMARY KEY ("id")
);


-- CreateTable
CREATE TABLE "HelpDesk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "domainId" UUID,

    CONSTRAINT "HelpDesk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FilterQuestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answered" TEXT,
    "domainId" UUID,

    CONSTRAINT "FilterQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerResponses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "question" TEXT NOT NULL,
    "answered" TEXT,
    "customerId" UUID NOT NULL,

    CONSTRAINT "CustomerResponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT,
    "propertyRequirements" TEXT,
    "salesStage" TEXT NOT NULL DEFAULT 'NEW',
    "domainId" UUID,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "live" BOOLEAN NOT NULL DEFAULT false,
    "mailed" BOOLEAN NOT NULL DEFAULT false,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "ticketStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "domainId" UUID,
    "customerId" UUID,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message" TEXT NOT NULL,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatRoomId" UUID,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" TIMESTAMP(3) NOT NULL,
    "slot" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "customerId" UUID,
    "domainId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "customers" TEXT[],
    "template" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduledAt" TIMESTAMP(3),
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "timezone" TEXT,
    "recurringType" TEXT,
    "recurringDay" INTEGER,
    "recurringTime" TEXT,
    "recurringActive" BOOLEAN NOT NULL DEFAULT false,
    "lastSentAt" TIMESTAMP(3),
    "nextSendAt" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image" TEXT NOT NULL DEFAULT '',
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domainId" UUID,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrustedDevice" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "userAgent" TEXT,
    "browserName" TEXT,
    "browserVersion" TEXT,
    "osName" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "ipAddress" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrustedDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "riskScore" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "city" TEXT,
    "region" TEXT,
    "country" TEXT,
    "userAgent" TEXT,
    "browserName" TEXT,
    "deviceType" TEXT,
    "deviceId" TEXT,
    "isTrustedDevice" BOOLEAN NOT NULL DEFAULT false,
    "otpRequired" BOOLEAN NOT NULL DEFAULT false,
    "otpVerified" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingLogin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "clerkSessionId" TEXT,
    "deviceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/DD/YYYY',
    "timeFormat" TEXT NOT NULL DEFAULT '12h',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "desktopNotifications" BOOLEAN NOT NULL DEFAULT true,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "defaultView" TEXT NOT NULL DEFAULT 'conversations',
    "conversationSort" TEXT NOT NULL DEFAULT 'newest',
    "itemsPerPage" INTEGER NOT NULL DEFAULT 25,
    "workingHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "workingHoursStart" TEXT,
    "workingHoursEnd" TEXT,
    "workingDays" TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkingHours" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domainId" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mondayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mondayClosed" BOOLEAN NOT NULL DEFAULT false,
    "tuesdayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tuesdayClosed" BOOLEAN NOT NULL DEFAULT false,
    "wednesdayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "wednesdayClosed" BOOLEAN NOT NULL DEFAULT false,
    "thursdayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "thursdayClosed" BOOLEAN NOT NULL DEFAULT false,
    "fridayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fridayClosed" BOOLEAN NOT NULL DEFAULT false,
    "saturdayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "saturdayClosed" BOOLEAN NOT NULL DEFAULT true,
    "sundayRanges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sundayClosed" BOOLEAN NOT NULL DEFAULT true,
    "blackoutDates" TIMESTAMP(3)[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAddress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "vatNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL,
    "plan" "Plans",
    "description" TEXT,
    "stripePaymentIntentId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "paymentMethod" TEXT,
    "paymentBrand" TEXT,
    "receiptUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseFile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "status" "KnowledgeBaseFileStatus" NOT NULL DEFAULT 'READY',
    "errorMessage" TEXT,
    "userId" UUID NOT NULL,
    "domainId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBaseFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseChunk" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "userId" UUID NOT NULL,
    "domainId" UUID,
    "fileId" UUID NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeBaseChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationUsage" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domainId" UUID NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingProgress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "addedDomain" BOOLEAN NOT NULL DEFAULT false,
    "customizedChatbot" BOOLEAN NOT NULL DEFAULT false,
    "uploadedKnowledge" BOOLEAN NOT NULL DEFAULT false,
    "copiedEmbedCode" BOOLEAN NOT NULL DEFAULT false,
    "exploredPricing" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationRating" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chatRoomId" UUID NOT NULL,
    "domainId" UUID NOT NULL,
    "rating" TEXT NOT NULL,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domainId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "location" TEXT,
    "propertyType" TEXT NOT NULL DEFAULT 'HOUSE',
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domainId" UUID NOT NULL,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "partySize" INTEGER NOT NULL DEFAULT 2,
    "date" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "specialOccasion" TEXT,
    "dietaryNotes" TEXT,
    "seatingPref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIUsageLog" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "domainId" UUID,
    "ipAddress" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "estimatedCostUsd" DOUBLE PRECISION NOT NULL,
    "responseTimeMs" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "blockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "Domain_userId_idx" ON "Domain"("userId");

-- CreateIndex
CREATE INDEX "Domain_verificationStatus_idx" ON "Domain"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ChatBot_domainId_key" ON "ChatBot"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "Billings_userId_key" ON "Billings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Billings_stripeSubscriptionId_key" ON "Billings"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Bookings_domainId_idx" ON "Bookings"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "TrustedDevice_deviceId_key" ON "TrustedDevice"("deviceId");

-- CreateIndex
CREATE INDEX "TrustedDevice_userId_idx" ON "TrustedDevice"("userId");

-- CreateIndex
CREATE INDEX "TrustedDevice_deviceId_idx" ON "TrustedDevice"("deviceId");

-- CreateIndex
CREATE INDEX "LoginAttempt_userId_idx" ON "LoginAttempt"("userId");

-- CreateIndex
CREATE INDEX "LoginAttempt_email_idx" ON "LoginAttempt"("email");

-- CreateIndex
CREATE INDEX "LoginAttempt_ipAddress_idx" ON "LoginAttempt"("ipAddress");

-- CreateIndex
CREATE INDEX "LoginAttempt_createdAt_idx" ON "LoginAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "PendingLogin_userId_idx" ON "PendingLogin"("userId");

-- CreateIndex
CREATE INDEX "PendingLogin_email_idx" ON "PendingLogin"("email");

-- CreateIndex
CREATE INDEX "OtpCode_userId_idx" ON "OtpCode"("userId");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserPreferences_userId_idx" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkingHours_domainId_key" ON "WorkingHours"("domainId");

-- CreateIndex
CREATE INDEX "WorkingHours_domainId_idx" ON "WorkingHours"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingAddress_userId_key" ON "BillingAddress"("userId");

-- CreateIndex
CREATE INDEX "BillingAddress_userId_idx" ON "BillingAddress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_stripePaymentIntentId_key" ON "PaymentHistory"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "PaymentHistory_userId_idx" ON "PaymentHistory"("userId");

-- CreateIndex
CREATE INDEX "PaymentHistory_createdAt_idx" ON "PaymentHistory"("createdAt");

-- CreateIndex
CREATE INDEX "KnowledgeBaseFile_userId_idx" ON "KnowledgeBaseFile"("userId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseFile_domainId_idx" ON "KnowledgeBaseFile"("domainId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseFile_status_idx" ON "KnowledgeBaseFile"("status");

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_userId_idx" ON "KnowledgeBaseChunk"("userId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_domainId_idx" ON "KnowledgeBaseChunk"("domainId");

-- CreateIndex
CREATE INDEX "KnowledgeBaseChunk_fileId_idx" ON "KnowledgeBaseChunk"("fileId");

-- CreateIndex
CREATE INDEX "ConversationUsage_domainId_idx" ON "ConversationUsage"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationUsage_domainId_month_year_key" ON "ConversationUsage"("domainId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingProgress_userId_key" ON "OnboardingProgress"("userId");

-- CreateIndex
CREATE INDEX "OnboardingProgress_userId_idx" ON "OnboardingProgress"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationRating_chatRoomId_key" ON "ConversationRating"("chatRoomId");

-- CreateIndex
CREATE INDEX "ConversationRating_domainId_idx" ON "ConversationRating"("domainId");

-- CreateIndex
CREATE INDEX "ConversationRating_createdAt_idx" ON "ConversationRating"("createdAt");

-- CreateIndex
CREATE INDEX "Property_domainId_idx" ON "Property"("domainId");

-- CreateIndex
CREATE INDEX "Reservation_domainId_idx" ON "Reservation"("domainId");

-- CreateIndex
CREATE INDEX "Reservation_date_idx" ON "Reservation"("date");

-- CreateIndex
CREATE INDEX "AIUsageLog_userId_idx" ON "AIUsageLog"("userId");

-- CreateIndex
CREATE INDEX "AIUsageLog_createdAt_idx" ON "AIUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AIUsageLog_ipAddress_idx" ON "AIUsageLog"("ipAddress");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatBot" ADD CONSTRAINT "ChatBot_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Billings" ADD CONSTRAINT "Billings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpDesk" ADD CONSTRAINT "HelpDesk_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterQuestions" ADD CONSTRAINT "FilterQuestions_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerResponses" ADD CONSTRAINT "CustomerResponses_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookings" ADD CONSTRAINT "Bookings_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrustedDevice" ADD CONSTRAINT "TrustedDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingLogin" ADD CONSTRAINT "PendingLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkingHours" ADD CONSTRAINT "WorkingHours_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAddress" ADD CONSTRAINT "BillingAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseFile" ADD CONSTRAINT "KnowledgeBaseFile_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseFile" ADD CONSTRAINT "KnowledgeBaseFile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBaseChunk" ADD CONSTRAINT "KnowledgeBaseChunk_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "KnowledgeBaseFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationUsage" ADD CONSTRAINT "ConversationUsage_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingProgress" ADD CONSTRAINT "OnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRating" ADD CONSTRAINT "ConversationRating_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationRating" ADD CONSTRAINT "ConversationRating_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIUsageLog" ADD CONSTRAINT "AIUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

