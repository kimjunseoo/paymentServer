import express from "express";
import paymentApiRouter from "./Routers/paymentApiRouter";
import mysql from "mysql";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const dbConnection = mysql.createConnection({
    host : 'localhost', 
    user : 'root', 
    password : 'mysql1228!', 
    database : 'payment_db'
});


app.use("/paymentApi", paymentApiRouter);

app.listen(3001, () => {
    console.log("Server is running")
});