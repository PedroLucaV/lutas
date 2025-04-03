import express from 'express';
import router from './routes/router.js';
import cors from 'cors';
import 'dotenv/config'

const app = express();

app.use(express.json()); 
app.use(cors())

app.get('/', (req, res) => {
    res.end("Index")
})

app.use('/api', router);

export default app;