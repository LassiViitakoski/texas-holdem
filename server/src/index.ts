import express, { Request, Response } from 'express';

const app = express();

const { PORT = 3000 } = process.env;

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: 'Application 1 Initialized',
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
