-- CreateEnum
CREATE TYPE "Room" AS ENUM ('GLOBAL', 'DEFAULT', 'ROOM1', 'ROOM2', 'WHISPER');

-- CreateTable
CREATE TABLE "ChatNest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "room" "Room" NOT NULL DEFAULT 'DEFAULT',
    "sendedTo" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatNest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatNest" ADD CONSTRAINT "ChatNest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserNest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
