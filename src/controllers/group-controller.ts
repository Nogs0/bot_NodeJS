import { z } from 'zod';

const GroupManager = require('../managers/group-manager');

exports.getAll = async (request: any, reply: any) => {
    let groups = await GroupManager.getAll();

    return reply.code(200)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ groups });
}

exports.create = async (request: any, reply: any) => {
    const createGroupSchema = z.object({
        name: z.string()
    });
    const { name } = createGroupSchema.parse(request.body);

    let group = await GroupManager.create(name);

    return reply.code(201)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ "message": `Group ${group.name} created!` });
}

exports.update = async (request: any, reply: any) => {
    const updateGroupSchema = z.object({
        name: z.string(),
        status: z.boolean()
    });

    let group = await GroupManager.update(updateGroupSchema);

    if (group)
        return reply.code(201)
            .header("Conten-type", "application/json;charset=utf-8")
            .send({ "message": `Group updated!` });

    return reply.code(201)
        .header("Conten-type", "application/json;charset=utf-8")
        .send({ "message": `Group doesn't found!` });
}