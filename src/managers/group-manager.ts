import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

type group = {
    name: string;
    status: boolean;
}

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

exports.update = async (group_data: group) => {
    let entity = await prisma.group.findFirst({
        where: {
            name: group_data.name
        }
    })

    if (entity)
        return await prisma.group.update({
            where: {
                id: entity.id
            },
            data: {
                name: group_data.name,
                status: group_data.status
            }
        })
    else return null;    
}