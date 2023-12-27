import { PrismaClient } from '@prisma/client';
import fastfy from 'fastify';
import { z } from 'zod';

const app = fastfy();

const prisma = new PrismaClient();

app.get('/drivers', async () => {
    const drivers = await prisma.driver.findMany();

    return { drivers };
})

app.post('/drivers', async (request, reply) => {
    const createDriverSchema = z.object({
        name: z.string(),
        phone_number: z.string()
    });
    const {name, phone_number} = createDriverSchema.parse(request.body);

    await prisma.driver.create({
        data: {
            name, 
            phone_number
        }
    });

    return reply
        .code(201)
        .header("Content-type", "application/json;charset=utf-8")
        .send({
        "message": "success"});
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => console.log("HTTP Server is running"))