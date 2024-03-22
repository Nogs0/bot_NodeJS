import { PrismaClient } from '@prisma/client';
import fastfy from 'fastify';

const app = fastfy();
const prisma = new PrismaClient();

const GroupController = require('./controllers/group-controller');
const DriverController = require('./controllers/driver-controller');

app.get('/groups', async (request, reply) => await GroupController.getAll(request, reply));

app.post('/groups/create', async (request, reply) => await GroupController.create(request, reply));

app.get('/drivers', async (request, reply) => await DriverController.getAll(request, reply));

app.post('/drivers/create', async (request, reply) => await DriverController.create(request, reply));

app.post('/drivers/update', async (request, reply) => await DriverController.update(request, reply));

app.put('/drivers/changeStatus', async (request, reply) => DriverController.changeStatus(request, reply));

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
        messageToReturn = "Olá, tudo bem? Espero que sim!\nEstou indisponível no momento! 😓\nSe for agendamento, respondo em alguns minutos! 😃";
        if (driversOn.length > 0)
            messageToReturn += "\nMas, a FNC conta com motoristas preparados para lhe atender! 🚗";
        for (let i = 0; i < driversOn.length; i++)
            messageToReturn += `\n- ${driversOn[i].name}: ${driversOn[i].phone_number}`
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
