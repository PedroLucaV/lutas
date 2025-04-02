import express from 'express';
import router from './routes/router.js';
import 'dotenv/config'

const app = express();

app.use(express.json()); 

app.get('/', (req, res) => {
    res.end("Index")
})

app.use('/api', router);

export default app;