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

export const requestPayment = (req, res) => {

    const customer = req.query.payment_id;
    const item_name = "빅파이"; //req.query.item_name;
    const price = 418; //req.query.price;
    const orderId = makePaymentId();

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
            //20230418 여기부터 수정. 데이터베이스에 값 넣고, 리턴값 설정 
            //로직은 피그마참고
            console.log(data);
        })
        .catch((error) => console.log("error :", error));

    return res.send("good");
}

/*
dbConnection.query(`INSERT INTO payment_data (payment_id, customer_id, item_name, price, status) VALUES (1, "testUser", "testitem", 0905, "approved");INSERT INTO ;`, (error, data) => {
                if(error) throw error;
                console.log("Info :", data);
                return res.send(data);
            })
*/

export const approve = (req, res) => {
    
   

    

    
    

    return res.send("Success");
}

export const cancel = (req, res) => {

}

export const order = (req, res) => {

}
