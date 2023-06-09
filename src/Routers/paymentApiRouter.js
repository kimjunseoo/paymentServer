import express from "express";
import { approve, cancel, order, requestPayment } from "../Controllers/paymentApiControllers";

const paymentApiRouter = express.Router();

//결제 생성 요청
//paymentApi/request
paymentApiRouter.route("/request").post(requestPayment);

//결제 승인 요청
//paymentApi/approve
paymentApiRouter.route("/approve").post(approve);

//결제 취소 요청
//paymentApi/cancel
paymentApiRouter.route("/cancel").post(cancel);


export default paymentApiRouter;