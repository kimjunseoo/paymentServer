# 결제 처리 서버

토스페이먼츠 결제 api 를 이용하여 결제 생성 / 결제 승인 / 결제 취소 api 를 지원하는 서버입니다.

- 기간 : 2023.04(2주) | 참여인원 : 1명(개인)
- 개발 스택 : JavaScript / Express.js / MySQL 
- 깃허브 링크 : https://github.com/kimjunseoo/paymentServer

---

## API 문서
- #### 결제 생성 api
  ```
  POST / http://localhost:3001/paymentApi/request
  ```
  
  - #### 목적 
    - 새로운 결제를 생성하고 결제 정보를 DB에 저장합니다. 
  
  
  - #### 결과
    - 성공 시,<br/>
      결제 성공을 알려주는 msg 속성과 결제 정보가 포함된 payment 객체를 json 형태로 반환합니다.

    - 실패 시,<br/>
      결제 실패를 알려주는 msg 속성과 결제 실패 원인이 포함된 객체를 json 형태로 반환합니다.
     
      
  - Request body 파라미터(필수)
 
    | 이름 | 설명 |
    | ------------ | ------------- |
    | customer_id | 결제자 이름입니다.  |
    | item_name | 제품 명입니다. |
    | price | 제품 가격입니다. |
 

<br/>

- #### 결제 승인 api
  ```
  POST / http://localhost:3001/paymentApi/approve
  ```
  
  - #### 목적 
    - 결제를 승인 혹은 거부하고 결제 정보를 DB에 저장합니다. 
  
  
  - #### 결과
    - 성공 시,<br/>
      결제 승인 성공을 알려주는 msg 속성과 결제 정보가 포함된 payment 객체를 json 형태로 반환합니다.

    - 실패 시,<br/>
      결제 승인 실패를 알려주는 msg 속성과 결제 승인 실패 원인이 포함된 객체를 json 형태로 반환합니다.
      

    
  - Request body 파라미터(필수)
 
    | 이름 | 설명 |
    | ------------ | ------------- |
    | orderId | 주문 번호입니다.  |
    | paymentKey | 결제 키입니다. |
    | amount | 제품 가격입니다. |
 

<br/>

- #### 결제 취소 api
  ```
  POST / http://localhost:3001/paymentApi/cancel
  ```
  
  - #### 목적 
    - 승인된 결제를 취소하고 결제 정보를 DB에 저장합니다. 
  
  
  - #### 결과
    - 성공 시,<br/>
      결제 취소 성공을 알려주는 msg 속성과 결제 취소 정보가 포함된 payment 객체를 json 형태로 반환합니다.

    - 실패 시,<br/>
      결제 취소 실패를 알려주는 msg 속성과 결제 취소 실패 원인이 포함된 객체를 json 형태로 반환합니다.
      
  - Request body 파라미터(필수)
 
    | 이름 | 설명 |
    | ------------ | ------------- |
    | orderId | 주문 번호입니다.  |
    | paymentKey | 결제 키입니다. |
    | cancelReason | 취소 사유입니다. |

## DB 테이블 구조
![image](https://user-images.githubusercontent.com/76796679/234135741-47a1c6af-bd02-440d-a780-5b0cd60f042e.png)

