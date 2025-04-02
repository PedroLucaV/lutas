import app from "./app.js";
import 'dotenv/config'
const port = Number(process.env.PORT) || 8810;

app.listen(port, () => {
    console.log("Server open in port: ", port);
})