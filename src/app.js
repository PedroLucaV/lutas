import express from 'express';
import 'dotenv/config'

const app = express();

app.get('/', (req, res) => {
    res.end("Index")
})

export default app;