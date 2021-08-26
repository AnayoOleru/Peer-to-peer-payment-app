import express from "express";
import NodeCache from "node-cache";

import {
  Response,
  logger,
  validateNewUser,
  validateDeposit,
  validateSendMoney,
} from "./utils";

const myCache = new NodeCache();
const app = express();

const port = process.env.PORT || 6000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send('Welcome to peer-to-peer-payment/server"');
});

// add user to the app
app.post("/user", validateNewUser, (req, res) => {
  const id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));

  // save new user
  myCache.set(id.toString(), { ...req.body, id, amount: 0 }, 500000);

  return Response(res, {
    status: 201,
    message: "User created successfully",
    data: { ...req.body, id, amount: 0 },
  });
});

// user deposit money
app.post("/user/deposit/:userId", validateDeposit, (req, res) => {
  const { userId } = req.params;

  if (!myCache.has(userId.toString())) {
    return Response(res, {
      status: 404,
      message: "User not found",
    });
  }

  const data = myCache.get(userId.toString());
  const setNewAmount = Number(data.amount) + Number(req.body.amount);

  data.amount = setNewAmount;

  myCache.set(userId.toString(), data, 500000);

  return Response(res, {
    status: 201,
    message: `You have successfully deposited ${req.body.amount}`,
    data,
  });
});

// user sends money
app.post("/user/send/:senderId/:receiverId", validateSendMoney, (req, res) => {
  const { senderId, receiverId } = req.params;
  const { amount } = req.body;

  if (!myCache.has(senderId.toString())) {
    return Response(res, {
      status: 404,
      message: "Sender not found",
    });
  }

  if (!myCache.has(receiverId.toString())) {
    return Response(res, {
      status: 404,
      message: "Receiver not found",
    });
  }

  const senderData = myCache.get(senderId);

  if (senderData.amount < amount) {
    return Response(res, {
      status: 403,
      message:
        "You can't send an amount that is greater than your current balance",
    });
  }

  const currencyData = {
    USD: 1,
    NAIRA: 411.57,
    YEN: 109.47,
    YUAN: 6.46,
  };

  const receiverData = myCache.get(receiverId);

  let convertedCurrency;

  // if senders currency is USD, multiply with receivers currency
  // e.g transfer 50 USD to YEN recipient => 50 * 109.47
  if (senderData.currency === "USD") {
    convertedCurrency = Number(amount) * currencyData[receiverData.currency];
  }

  // if senders currency isn't USD, divide with senders currency
  // e.g transfer 50 YUAN to USD recipient => 50 / 6.46
  if (senderData.currency !== "USD") {
    convertedCurrency = Number(amount) / currencyData[senderData.currency];
  }

  const setNewReceiverAmount =
    Number(receiverData.amount) + Number(convertedCurrency);

  receiverData.amount = setNewReceiverAmount;

  const setNewSenderAmount =
    Number(senderData.amount) - Number(req.body.amount);

  senderData.amount = setNewSenderAmount;

  myCache.set(senderId.toString(), senderData);
  myCache.set(receiverId.toString(), receiverData);

  return Response(res, {
    status: 200,
    message: `You have successfully sent ${amount}`,
    data: senderData,
  });
});

// check balance
app.get("/user/balance/:userId", (req, res) => {
  const { userId } = req.params;

  if (!myCache.has(userId.toString())) {
    return Response(res, {
      status: 404,
      message: "User not found",
    });
  }

  const data = myCache.get(userId.toString());

  return Response(res, {
    status: 200,
    message: `Your current account balance is ${data.amount}`,
    data,
  });
});

app.all("*", (req, res) => {
  Response(res, { status: 404, message: "This route does not exist yet!" });
});

app.listen(port, () => {
  logger(
    `Peer-to-peer-payment project server is Running at: http://localhost:6000`
  );
});

export default app;

// darius.simmons05@gmail.com
