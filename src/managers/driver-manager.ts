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
    });
}

exports.update = async (id: number, online: boolean) => {
    return await prisma.driver.update({
        where: {
            id
        },
        data: {
            online
        }
    })
}

exports.getByPhoneNumber = async (phone_number: string) => {
    return await prisma.driver.findFirst({
        where: {
            phone_number
        }
    })
}

exports.changeStatus = async (id: number, status: boolean) => {
    return await prisma.driver.update({
        where: {
            id
        },
        data: {
            status
        }
    })
}