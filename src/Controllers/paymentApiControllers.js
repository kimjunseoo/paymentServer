import mysql from "mysql";
import dotenv from "dotenv";
import { json } from "express";
import { BASE64_TOSS_SECRET_KEY } from "../env";

dotenv.config();

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
    database : 'payment_db'
});

export const requestPayment = async (req, res) => {

    const orderId = makePaymentId();
    const customer_id = "test" //req.body.customer_id;
    const item_name = "빅파이"; //req.body.item_name;
    const price = 418; //req.body.price;
    

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
                dbConnection.query(`INSERT INTO payment_data (payment_id, customer_id, item_name, price, status) VALUES ("${orderId}", "${customer_id}", "${item_name}", ${price}, "genSuccess");`, (error, rows) => {
                    if(error){
                        console.log(error);
                        return res.status(500);
                    }
                });

                return res.status(200).json({
                    msg : "payment generate success"
                })
            }
            // 에러일 때(에러 객체를 반환받을 때)
            else if(data.message){
                dbConnection.query(`INSERT INTO payment_data (payment_id, customer_id, item_name, price, status) VALUES ("${orderId}", "${customer_id}", "${item_name}", ${price}, "genFail");`, (error, rows) => {
                    if(error){
                        console.log(error);
                        return res.status(500);
                    }
                });

                return res.status(200).json({
                    msg : "payment generate fail"
                })
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
        dbConnection.query(`UPDATE payment_data SET status = 'success' WHERE payment_id = "${orderId}" `, (error, rows) => {
            if(error){
                console.log(error);
            }
        });
        console.log(data);
        return res.status(200).json({
            data
        });  
    })
    .catch((error) => {
        dbConnection.query(`UPDATE payment_data SET status = 'fail' WHERE payment_id = "${orderId}" `, (error, rows) => {
            if(error){
                console.log(error);
            }
        });
        return res.status(501).json({
            errorMessage : error
        });
    })
}

export const cancel = (req, res) => {

}

export const order = (req, res) => {

}
