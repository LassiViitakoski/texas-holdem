import { PrismaClient } from '@prisma/client';

const func = () => console.log('random-function');

(async () => {
    const prisma = new PrismaClient();
/*    const player = await prisma.player.create({
        data: {
            ,
        },
    }); */
})();

export { func };
