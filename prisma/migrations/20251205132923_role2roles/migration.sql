/*
  Warnings:

  - You are about to drop the column `role` on the `UserNest` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "UserNest" DROP COLUMN "role",
ADD COLUMN     "roles" "Roles"[] DEFAULT ARRAY['USER']::"Roles"[];
