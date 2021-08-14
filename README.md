# Peer-to-peer-payment-app

### Getting started

## Install and run locally

```
$ npm i

$ npm run dev
```

## Test
```
$ npm run test
```

## ENDPOINTS

| method |	route	                | description                    |
|--------|--------------------------|--------------------------------|
| POST 	 | /user	                | Add user to the app            |
| POST	 | /user/deposit/:userId    | User deposits money            |
| POST	 | /user/send/:senderId/:receiverId	| User sends money       |
| GET    | //user/balance/:userId   | User checks their balance      |
