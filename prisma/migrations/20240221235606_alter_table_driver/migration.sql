-- AlterTable
ALTER TABLE "Driver" ADD COLUMN     "group_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
