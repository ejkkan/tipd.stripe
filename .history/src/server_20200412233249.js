require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const {
  getStripeUser,
  createStripeUser,
  createStripeCard,
} = require("./queries");

const app = express();
const PORT = process.env.PORT || 3500;
app.use(bodyParser.json());

export const test = async (req, res, next) => {
  console.log("req");
  try {
    console.log("req", req.body);
    console.log("event", req.body.event);
    console.log("data", req.body.event.data);
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createStripeUser", createStripeUser);
app.post("/createStripeCard", createStripeCard);
app.post("/test", test);

app.listen(PORT);
