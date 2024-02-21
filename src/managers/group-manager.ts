import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

exports.getAll = async () => {
    return await prisma.group.findMany();
}

exports.create = async (name: string) => {
    return await prisma.group.create({
        data: {
            name
        }
    });
}