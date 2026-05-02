-- DropForeignKey
ALTER TABLE "SegmentMembership" DROP CONSTRAINT "SegmentMembership_segmentId_fkey";

-- DropForeignKey
ALTER TABLE "SegmentMembership" DROP CONSTRAINT "SegmentMembership_userId_fkey";

-- AddForeignKey
ALTER TABLE "SegmentMembership" ADD CONSTRAINT "SegmentMembership_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SegmentMembership" ADD CONSTRAINT "SegmentMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
