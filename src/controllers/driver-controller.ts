import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

exports.getAll = async () => {
    return await prisma.driver.findMany();
}

exports.create = async (name: string, phone_number: string) => {
    return await prisma.driver.create({
        data: {
            name,
            phone_number
        }
    })
}