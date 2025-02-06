import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import { api } from "./api.js";



const app = express();

app.use(bodyParser.json())
app.use("/api", api)


app.get("/hello", (req, res) => {
  res.send("Hello Vite + React!");
});

ViteExpress.listen(app, 8081, () =>
  console.log("Server is listening on port 8081..."),
);
