import express from "express";
import paymentApiRouter from "./Routers/paymentApiRouter";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const dbConnection = mysql.createConnection(process.env.DBCONFIG);


app.use("/paymentApi", paymentApiRouter);

app.listen(3001, () => {
    console.log("Server is running")
});