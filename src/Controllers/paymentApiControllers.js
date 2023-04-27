import mysql from "mysql";
import dotenv from "dotenv";
import { json } from "express";
import { BASE64_TOSS_SECRET_KEY } from "../env";

dotenv.config();

//변수 undefiend 검증 함수
function isItUndifiend(a, b, c){
    if(a == undefined || b == undefined || c == undefined){
        return true;
    }else {
        return false;
    }
}

//YYYYMMDDhhmmss 포맷 함수
function getCurrentDate()
{
    var date = new Date();
    var year = date.getFullYear().toString();

    var month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    var day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    var hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    var minites = date.getMinutes();
    minites = minites < 10 ? '0' + minites.toString() : minites.toString();

    var seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    return year + month + day + hour + minites + seconds;
}
//주문번호 생성 함수
function makePaymentId(){
    //YYYY-MM-DD
    let datetime = getCurrentDate(); 
    //4자리 랜덤 숫자
    let num = Math.random();
    num = num.toString();
    
    return datetime + num.substr(2,4);
}

const dbConnection = mysql.createConnection({
    host : 'localhost', 
    user : 'root', 
    password : 'mysql1228!', 
    database : 'payment_db',
    multipleStatements: true
});

export const requestPayment = async (req, res) => {

    const orderId = makePaymentId();
    const customer_id = req.body.customer_id;
    const item_name = req.body.item_name;
    const price = req.body.price;
    
    if(isItUndifiend(customer_id, item_name, price)){
        return res.status(500).json({
            msg : "필수 파라미터가 누락되었습니다."
        })
    }

    fetch('https://api.tosspayments.com/v1/payments', {
        method: 'POST',
        headers: {
            'Authorization': `${BASE64_TOSS_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'amount': `${price}`,
            'failUrl': 'http://localhost:3001/fail',
            'method': '카드',
            'orderId': `${orderId}`,
            'orderName': `${item_name}`,
            'successUrl': 'http://localhost:3001/success'
        })
        }).then((response) => response.json())
        .then((data) => {
            // 정상일 때
            if(!data.message){
                dbConnection.query(`INSERT INTO payment_data (payment_id, customer_id, item_name, price, pay_gen_at, status) VALUES ("${orderId}", "${customer_id}", "${item_name}", ${price}, now(), "genSuccess");`, (error, rows) => {
                    if(error){
                        console.log(error);
                        return res.status(500).json({
                            msg : "error when querying db",
                            data : data
                        });
                    } else {
                        return res.status(200).json({
                            msg : "payment generate success",
                            data : data
                        });
                    }
                });  
            }
            // 에러일 때(에러 객체를 반환받을 때)
            else if(data.message){
                dbConnection.query(`INSERT INTO payment_data (payment_id, customer_id, item_name, price, pay_gen_fail_at, status) VALUES ("${orderId}", "${customer_id}", "${item_name}", ${price}, now(), "genFail");`, (error, rows) => {
                    if(error){
                        console.log(error);
                        return res.status(500).json({
                            msg : "error when querying db",
                            data : data
                        });
                    } else {
                        return res.status(501).json({
                            msg : "payment generate fail",
                            errorCode : data.code,
                            errorMessage : data.message
                        }) 
                    }
                });
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

export const approve = (req, res) => {
    
    const orderId = req.body.orderId;
    const paymentKey = req.body.paymentKey;
    const amount = req.body.amount;

    if(isItUndifiend(orderId, paymentKey, amount)){
        return res.status(500).json({
            msg : "API Fail / 필수 파라미터가 누락되었습니다."
        })
    }

    fetch('https://api.tosspayments.com/v1/payments/confirm', {
        method: 'POST',
        headers: {
            'Authorization': `${BASE64_TOSS_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'paymentKey': paymentKey,
            'orderId': orderId,
            'amount': amount
        })
        }).then((response) => response.json())
    .then((data) => {
        // 정상일 때
        if(!data.message){
            dbConnection.query(`UPDATE payment_data SET pay_approve_at = now(), status = 'paySuccess' WHERE payment_id = "${orderId}";`, (error, rows) => {
                if(error){
                    console.log(error);
                    return res.status(500).json({
                        msg : "error when querying db",
                        data : data
                    });
                } else {
                    return res.status(200).json({
                        msg : "payment approve success",
                        data : data
                    });
                }
            });
        }
        // 에러일 때(에러 객체를 반활받을 때)
        else if(data.message){
            dbConnection.query(`UPDATE payment_data SET pay_approve_fail_at = now(), status = 'payFail' WHERE payment_id = "${orderId}";`, (error, rows) => {
                if(error){
                    console.log(error);
                    return res.status(500).json({
                        msg : "error when querying db",
                        data : data
                    });
                } else {
                    return res.status(501).json({
                        msg : "payment approve fail",
                        errorCode : data.code,
                        errorMessage : data.message
                    })
                }
            });
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

export const cancel = (req, res) => {

    const paymentKey = req.body.paymentKey;
    const cancelReason = req.body.cancelReason;
    const orderId = req.body.orderId;

    if(isItUndifiend(paymentKey, cancelReason, orderId)){
        return res.status(500).json({
            msg : "필수 파라미터가 누락되었습니다."
        })
    }

    fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
            'Authorization': `${BASE64_TOSS_SECRET_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'cancelReason': `${cancelReason}`
        })
    }).then((response) => response.json())
    .then((data) => {
        // 정상일 때
        if(!data.message){
            dbConnection.query(`UPDATE payment_data SET pay_cancel_at = now(), status = 'payCancelSuccess' WHERE payment_id = ${orderId}`, (error, rows) => {
                if(error){
                    console.log(error);
                    return res.status(500).json({
                        msg : "error when querying db",
                        data : data
                    });
                } else {
                    return res.status(200).json({
                        msg : "payment cancel success",
                        errorCode : data.code,
                        errorMessage : data.message
                    });
                }
            })
        } 
        // 에러일 때(에러 객체를 반환받을 때)
        else if(data.message){
            dbConnection.query(`UPDATE payment_data SET pay_cancel_fail_at = now(), status = 'payCancelFail' WHERE payment_id = ${orderId}`, (error, rows) => {
                if(error){
                    console.log(error);
                    return res.status(500).json({
                        msg : "error when querying db",
                        data : data
                    });
                } else {
                    return res.status(200).json({
                        msg : "payment cancel fail",
                        data : data
                    });
                }
            })
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

