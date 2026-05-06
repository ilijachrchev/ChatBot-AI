-- CreateTable
CREATE TABLE "StripeEventLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEventLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StripeEventLog_eventId_key" ON "StripeEventLog"("eventId");

-- CreateIndex
CREATE INDEX "StripeEventLog_createdAt_idx" ON "StripeEventLog"("createdAt");
