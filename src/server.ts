import { PrismaClient } from '@prisma/client';
import fastfy from 'fastify';
import { z } from 'zod';

const app = fastfy();
const prisma = new PrismaClient();

const GroupController = require('./controllers/group-controller');
const DriverController = require('./controllers/driver-controller');

app.get('/groups', async (request, reply) => await GroupController.getAll(request, reply));

app.post('/groups/create', async (request, reply) => await GroupController.create(request, reply));

app.post('/groups/update', async (request, reply) => await GroupController.update(request, reply));

app.get('/drivers', async (request, reply) => {
    let drivers = await DriverController.getAll();

    return reply.code(200)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ drivers });
})

app.post('/drivers/create', async (request, reply) => {
    const createDriverSchema = z.object({
        name: z.string(),
        phone_number: z.string()
    });
    const { name, phone_number } = createDriverSchema.parse(request.body);

    let driver = await DriverController.create(name, phone_number);

    return reply
        .code(201)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ "message": `Driver ${driver.name} created!` });
})

app.post('/drivers/update', async (request, reply) => {

    const appJson = z.object(
        {
            appPackageName: z.string(),
            messengerPackageName: z.string(),
            query: z.object({
                sender: z.string(),
                message: z.string(),
                isGroup: z.boolean(),
                groupParticipant: z.string(),
                ruleId: z.number(),
                isTestMessage: z.boolean()
            })
        }
    );

    const { query } = appJson.parse(request.body);

    let driver = await prisma.driver.findFirst({
        where: {
            phone_number: query.groupParticipant
        },
    });

    let messageToReturn = "Motorista não cadastrado!";

    if (driver) {
        let status = query.message.toUpperCase().trim();
        if (status == "ONLINE" || status == "ON")
            driver.online = true;
        else if (status == "OFFLINE" || status == "OFF")
            driver.online = false;
        else return;

        driver = await prisma.driver.update({
            where: {
                id: driver.id
            },
            data: {
                online: driver.online
            },
        })

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
})

app.post('/message', async (request, reply) => {

    let phone_number = request.headers.motorista?.toString();

    let driver = await prisma.driver.findFirst({
        where: {
            phone_number: phone_number
        }
    });

    let messageToReturn = "";

    if (!driver || !driver.online) {
        let driversOn = await prisma.driver.findMany({
            where: {
                online: true
            }
        });

        driversOn = shuffle(driversOn);
        messageToReturn = "Olá, tudo bem? Espero que sim!\nEstou indisponível no momento! 😓\nSe for agendamento, respondo em alguns minutos!😃";
        if (driversOn.length > 0)
            messageToReturn += "\nMas, a FNC conta com motoristas preparados para lhe atender! 🚗";
        for (let i = 0; i < driversOn.length; i++)
            messageToReturn += `\n🔷 ${driversOn[i].name}: ${driversOn[i].phone_number}`
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
})

app.put('/changeStatus', async (request, reply) => {
    const query = z.object(
        {
            phone_number: z.string(),
            status: z.boolean()
        }
    );

    const { phone_number, status } = query.parse(request.body);

    let driver = await prisma.driver.findFirst({
        where: {
            phone_number: phone_number
        }
    });

    if (driver) {
        driver = await prisma.driver.update({
            where: {
                id: driver.id
            },
            data: {
                status: status
            },
        })

        return reply.code(200)
            .header("Content-type", "application/json;charset=utf-8")
            .send({
                "message": `${driver.name} is ${driver.status ? "active" : "inactive"}`
            });
    }
    else return reply.code(200)
        .header("Content-type", "application/json;charset=utf-8")
        .send({
            "message": `Driver not found`
        });
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => console.log("HTTP Server is running"))


function shuffle(array: any) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}