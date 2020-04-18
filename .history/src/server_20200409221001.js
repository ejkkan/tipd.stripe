const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const createAd = async (req, res, next) => {
  const { title, description, type, images } = req.body.input;

  try {
    // insert into db
    console.log("sdfds");
    const HASURA_MUTATION = `
       mutation ($title: String!, $description: String!, $type: ad_type_enum!) {
          insert_ads(objects: {type: $type, title: $title, price: 110, description: $description}) {
            returning {
              id
            }
          }
        }
      `;
    const variables = { title, description, type };

    // execute the parent mutation in Hasura
    const fetchResponse = await fetch("http://localhost:8080/v1/graphql", {
      headers: { Authorization: "Bearer ef34bc2611423fd0d71bf9ba7588c039" },
      method: "POST",
      body: JSON.stringify({
        query: HASURA_MUTATION,
        variables,
      }),
    });
    const { data, errors } = await fetchResponse.json();
    console.log(data);

    // if Hasura operation errors, then throw error
    if (errors) {
      return res.status(400).json({
        message: errors.message,
      });
    }

    // success
    return res.json({ id: data.id, images });
  } catch (e) {
    console.log("e", e);
    next(e);
  }
};

app.post("/createAd", createAd);
app.post("/hello", async (req, res) => {
  return res.json({
    hello: "world",
  });
});

app.listen(PORT);
