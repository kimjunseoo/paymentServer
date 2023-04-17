import express from "express";
import { approve, cancel, order } from "../Controllers/paymentApiControllers";

const paymentApiRouter = express.Router();

//결제 승인 요청
paymentApiRouter.route("/approve").post(approve);

//결제 취소 요청
paymentApiRouter.route("/cancel").post(cancel);

//결제 조회 요청
paymentApiRouter.route("/order").post(order);


export default paymentApiRouter;