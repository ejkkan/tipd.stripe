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
  const { stripeId } = req.body.input;
  try {
    const user = await stripe.customers
      .retrieve(stripeId)
      .then((customer) => customer);

    if (!user) {
      return res.status(400).json({
        message: "Could not find stripe user",
      });
    }
    return res.status(200).json({ id: user.id, email: user.email });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createStripeUser", createStripeUser);
app.post("/createStripeCard", createStripeCard);
app.post("/test", test);

app.listen(PORT);
