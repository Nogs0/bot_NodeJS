import { z } from 'zod';
const DriverManager = require('../managers/driver-manager');

exports.getAll = async (request: any, reply: any) => {
    let drivers =  await DriverManager.getAll();

    return reply.code(200)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ drivers });
}

exports.create = async (request: any, reply: any) => {
    const createDriverSchema = z.object({
        name: z.string(),
        phone_number: z.string()
    });
    const { name, phone_number } = createDriverSchema.parse(request.body);

    let driver = await DriverManager.create(name, phone_number);

    return reply
        .code(201)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ "message": `Driver ${driver.name} created!` });
}

exports.update = async (request: any, reply: any) => {
    const appJson = z.object(
        {
            appPackageName: z.string(),
            messengerPackageName: z.string(),
            query: z.object({
                sender: z.string().nullable(),
                message: z.string(),
                isGroup: z.boolean(),
                groupParticipant: z.string(),
                ruleId: z.number(),
                isTestMessage: z.boolean()
            })
        }
    );

    const { query } = appJson.parse(request.body);

    let messageToReturn = "Motorista não cadastrado!";
    
    let driver = await DriverManager.getByPhoneNumber(query.groupParticipant);
    if (driver) {
        let status = query.message.toUpperCase().trim();
        if (status == "ONLINE" || status == "ON" || status == "ON-LINE")
            driver.online = true;
        else if (status == "OFFLINE" || status == "OFF" || status == "OFF-LINE")
            driver.online = false;
        else return;

        driver = await DriverManager.update(driver.id, driver.online);

        messageToReturn = `Motorista ${driver.name} está ${driver.online ? "online 🟢" : "offline 🔴"}!`;
    }

    return reply
        .code(200)
        .header("Content-type", "application/json;charset=utf-8")
        .send({
            "replies": [
                {
                    "message": messageToReturn
                }
            ]
        });
} 

exports.changeStatus = async (request: any, reply: any) => {
    const query = z.object(
        {
            phone_number: z.string(),
            status: z.boolean()
        }
    );

    const { phone_number, status } = query.parse(request.body);

    let driver = await DriverManager.getByPhoneNumber(phone_number);

    if (driver) {
        driver = await DriverManager.changeStatus(driver.id, status);

        return reply.code(200)
            .header("Content-type", "application/json;charset=utf-8")
            .send({
                "message": `${driver.name} is ${driver.status ? "active" : "inactive"}`
            });
    }
    else return reply.code(404)
        .header("Content-type", "application/json;charset=utf-8")
        .send({
            "message": `Driver not found`
        });
}