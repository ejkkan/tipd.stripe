const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");

const app = express();

const PORT = process.env.PORT || 3000;

const CREATE_AD_MUTATION = `
       mutation ($title: String!, $description: String!, $type: ad_type_enum!) {
          insert_ads(objects: {type: $type, title: $title, price: 110, description: $description}) {
            returning {
              id
            }
          }
        }
      `;

const CREATE_IMAGE_MUTATION = `
       mutation ($ad: Int!, $image: String!, $primary: Boolean!) {
          insert_ad_images(objects: {ad: $ad, image: $image, primary: $primary})
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

const createImages = async (id, arr, headers) =>
  await Promise.all(
    arr.map(async (image, i) => {
      const variables = { image, id, primary: i === 0 };
      console.log({ variables });
      const response = await makeRequest(
        CREATE_IMAGE_MUTATION,
        variables,
        headers
      );
      return response.json();
    })
  );

app.use(bodyParser.json());

const createAd = async (req, res, next) => {
  const { title, description, type, images } = req.body.input;
  const { authorization } = req.headers;
  const headers = { authorization };
  try {
    // insert into db
    console.log("sdfds");

    const ad_variables = { title, description, type };

    // execute the parent mutation in Hasura
    const fetchResponse = await makeRequest(
      CREATE_AD_MUTATION,
      ad_variables,
      headers
    );

    const { data, errors } = await fetchResponse.json();
    const fetchResponse2 = await makeRequest(
      CREATE_IMAGE_MUTATION,
      images.map((image, i) => {
        return { image, id, primary: i === 0 };
      }),
      headers
    );
    const imagesRes = await fetchResponse2.json();
    console.log("fimagesRes", imagesRes.errors);
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
