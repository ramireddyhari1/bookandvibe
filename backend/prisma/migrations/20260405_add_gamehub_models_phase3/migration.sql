-- CreateTable
CREATE TABLE IF NOT EXISTS "GamehubFacility" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "distance" TEXT NOT NULL DEFAULT '0 km away',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "pricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'hr',
    "priceRange" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "openHours" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "pricingRules" TEXT NOT NULL DEFAULT '[]',
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "features" TEXT NOT NULL DEFAULT '[]',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "gallery" TEXT NOT NULL DEFAULT '[]',
    "battleModes" TEXT NOT NULL DEFAULT '[]',
    "slotTemplate" TEXT NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GamehubFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GamehubReview" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'U',
    "helpful" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "GamehubReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GamehubBooking" (
    "id" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "paymentMethod" TEXT NOT NULL DEFAULT 'MOCK',
    "paymentStatus" TEXT NOT NULL DEFAULT 'SUCCESS',
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "GamehubBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "GamehubBlockedSlot" (
    "id" TEXT NOT NULL,
    "blockDate" TIMESTAMP(3) NOT NULL,
    "slotLabel" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT 'Blocked by admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    "facilityId" TEXT NOT NULL,

    CONSTRAINT "GamehubBlockedSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubFacility_location_idx" ON "GamehubFacility"("location");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubFacility_type_idx" ON "GamehubFacility"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubFacility_rating_idx" ON "GamehubFacility"("rating");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubFacility_pricePerHour_idx" ON "GamehubFacility"("pricePerHour");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubReview_facilityId_createdAt_idx" ON "GamehubReview"("facilityId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "GamehubBooking_transactionId_key" ON "GamehubBooking"("transactionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubBooking_userId_createdAt_idx" ON "GamehubBooking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubBooking_facilityId_bookingDate_idx" ON "GamehubBooking"("facilityId", "bookingDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubBooking_status_idx" ON "GamehubBooking"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubBlockedSlot_facilityId_blockDate_idx" ON "GamehubBlockedSlot"("facilityId", "blockDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GamehubBlockedSlot_facilityId_blockDate_slotLabel_idx" ON "GamehubBlockedSlot"("facilityId", "blockDate", "slotLabel");

-- AddForeignKey
ALTER TABLE "GamehubReview" ADD CONSTRAINT "GamehubReview_facilityId_fkey"
FOREIGN KEY ("facilityId") REFERENCES "GamehubFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamehubBooking" ADD CONSTRAINT "GamehubBooking_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamehubBooking" ADD CONSTRAINT "GamehubBooking_facilityId_fkey"
FOREIGN KEY ("facilityId") REFERENCES "GamehubFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GamehubBlockedSlot" ADD CONSTRAINT "GamehubBlockedSlot_facilityId_fkey"
FOREIGN KEY ("facilityId") REFERENCES "GamehubFacility"("id") ON DELETE CASCADE ON UPDATE CASCADE;
