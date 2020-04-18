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
      email: user.email,
    })
    .then((customer) => customer);
};

const app = express();

const PORT = process.env.PORT || 3500;

const CREATE_AD_MUTATION = `
  mutation ($title: String!, $description: String!, $type: ad_type_enum!) {
    insert_ads_one(object: {type: $type, title: $title, price: 110, description: $description}) {
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
  const { email, id } = req.body.input;

  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    // insert into db
    console.log("sdfds", req.headers);
    const stripeUser = await createUser(email);
    console.log("stripeUser", stripeUser);
    // const ad_variables = { title, description, type };

    // execute the parent mutation in Hasura
    // const fetchResponse = await makeRequest(
    //   CREATE_AD_MUTATION,
    //   ad_variables,
    //   headers
    // );

    // const { data, errors } = await fetchResponse.json();
    // if (errors) {
    //   return res.status(400).json({
    //     message: errors.message,
    //   });
    // }

    // success
    return res.status(200).json({ title: "dsf" });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createAd", createAd);

app.listen(PORT);
