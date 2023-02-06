import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./configs/viewEngine";
import initAuthRoutes from "./routes/authRouter";
import initPostsRoutes from "./routes/postsRouter";
import initUserRoutes from "./routes/userRouter";
require("dotenv").config();

const app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

viewEngine(app);
initAuthRoutes(app);
initPostsRoutes(app);
initUserRoutes(app);

app.listen(port, () => {
  console.log("backend running");
});
