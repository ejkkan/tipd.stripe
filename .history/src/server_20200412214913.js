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

const createUser = async (user) => {
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

  const userId = req.body.session_variables["x-hasura-user-id"];
  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    // insert into db

    const { id } = await createUser(email);
    console.log("stripeUser", id);
    const variables = { userId, stripeId: id };
    console.log("variables", variables);
    // execute the parent mutation in Hasura
    const response = await makeRequest(
      UPDATE_USER_STRIPE_ID,
      variables,
      headers
    );

    const { data, errors } = await response.json();
    console.log("data", data, errors);
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }

    // success
    return res.status(200).json({ id });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createStripeUser", createStripeUser);

app.listen(PORT);
