-- AlterTable
ALTER TABLE "citizens" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "resetToken" TEXT,
ADD COLUMN     "resetTokenExpiry" TEXT;
