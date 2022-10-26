import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import initWebRoutes from "./routes/ApiWeb";
require('dotenv').config();

const app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

viewEngine(app);
initWebRoutes(app);

app.get('/', (req, res) => {
    res.send('Hello');
})

app.listen(port, () => {
    console.log('backend running');
});