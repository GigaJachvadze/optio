/*
  Warnings:

  - You are about to drop the column `habbits` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "habbits",
ADD COLUMN     "habits" JSONB;
