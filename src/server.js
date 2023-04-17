import express from "express";
import paymentApiRouter from "./Routers/paymentApiRouter";

const app = express();

app.use("/paymentApi", paymentApiRouter);

app.listen(3001, () => {
    console.log("Server is running")
});