require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const {
  getStripeUser,
  createStripeUser,
  createStripeCard,
  createStripeCharge,
  createStripeTransfer,
} = require("./queries");

const app = express();
const PORT = process.env.PORT || 3500;
app.use(bodyParser.json());

app.post("/createStripeUser", createStripeUser);
app.post("/createStripeCard", createStripeCard);
app.post("/getStripeUser", getStripeUser);
app.post("/createCharge", createStripeCharge);
app.post("/createTransfer", createStripeTransfer);
app.listen(PORT);
