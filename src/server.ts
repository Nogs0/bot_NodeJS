import { PrismaClient } from '@prisma/client';
import fastfy from 'fastify';
import { z } from 'zod';

const app = fastfy();

const prisma = new PrismaClient();

app.get('/drivers', async () => {
    const drivers = await prisma.driver.findMany();

    return { drivers };
})

app.post('/drivers/create', async (request, reply) => {
    const createDriverSchema = z.object({
        name: z.string(),
        phone_number: z.string(),
        online: z.boolean()
    });
    const { name, phone_number, online } = createDriverSchema.parse(request.body);

    await prisma.driver.create({
        data: {
            name,
            phone_number,
            online
        }
    })
    return reply
        .code(201)
        .header("Content-type", "application/json;charset=utf-8")
        .send({ "message": "success" });
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

    var phone_number = request.headers.motorista?.toString();

    var driver = await prisma.driver.findFirst({
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