const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const stripe = require("stripe")("sk_test_TI2XxnUrgOKsQA9YdEHlTKgY00e6DeF6M4");

const createCard = async (stripeUserId, card_token) => {
  return await stripe.customers
    .createSource(stripeUserId, {
      source: card_token,
    })
    .then((card) => card);
};

const createUser = async (email) => {
  return await stripe.customers
    .create({
      email,
    })
    .then((customer) => customer);
};

const app = express();

const PORT = process.env.PORT || 3500;

const UPDATE_USER_STRIPE_ID = `
  mutation ($userId: Int!, $stripeId: String!) {
    update_users_by_pk(pk_columns: {id: $userId},  _set: {stripeId: $stripeId}) {
      id
      stripeId
    }
  }
`;

const CREATE_CREDIT_CARD = `
  mutation ($stripeCardId: String!) {
    insert_credit_card_one(object: {stripeCardId: $stripeCardId}) {
      id
    }
  }
`;

const makeRequest = async (mutation, variables, headers) =>
  await fetch("http://localhost:8080/v1/graphql", {
    headers,
    method: "POST",
    body: JSON.stringify({
      query: mutation,
      variables,
    }),
  });

app.use(bodyParser.json());

const createStripeUser = async (req, res, next) => {
  const { email } = req.body.input;
  if (!email) {
    return res.status(400).json({
      message: "Invalid email",
    });
  }
  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    const { id } = await createUser(email);

    const variables = { userId, stripeId: id };
    const response = await makeRequest(
      UPDATE_USER_STRIPE_ID,
      variables,
      headers
    );

    const { errors } = await response.json();
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

const createStripeCard = async (req, res, next) => {
  const { token, stripeId } = req.body.input;
  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };

  try {
    const card = await createCard(stripeId, token);
    console.log("card", card);
    const variables = { stripeCardId: card.id };
    const response = await makeRequest(CREATE_CREDIT_CARD, variables, headers);

    const { data, errors } = await response.json();
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }
    return res.status(200).json({ card: data.insert_credit_card_one.id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

const getStripeUser = async (req, res, next) => {
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
app.post("/getStripeUser", getStripeUser);

app.listen(PORT);
