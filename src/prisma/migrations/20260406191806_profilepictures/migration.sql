/*
  Warnings:

  - You are about to drop the column `profilePics` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profilePics",
ADD COLUMN     "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "profilePicture" TEXT NOT NULL DEFAULT 'https://res.cloudinary.com/djoahpirg/image/upload/v1745277187/wepadt9fizw8vlmnqiyz.jpg';
